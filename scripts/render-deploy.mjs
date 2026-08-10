import crypto from "node:crypto";

const API_BASE = "https://api.render.com/v1";
const REPO = "https://github.com/turlang/motoclube-beneficios";
const BRANCH = "main";
const API_NAME = "motoclube-beneficios-api";
const WEB_NAME = "motoclube-beneficios-web";
const REGION = (process.env.RENDER_REGION || "virginia").trim();

function required(name, { removeAllWhitespace = false } = {}) {
  const raw = process.env[name];
  if (!raw) throw new Error(`Variável obrigatória ausente: ${name}`);
  const value = removeAllWhitespace ? raw.replace(/\s+/g, "") : raw.trim();
  if (!value) throw new Error(`Variável obrigatória vazia: ${name}`);
  return value;
}

const RENDER_API_KEY = required("RENDER_API_KEY", { removeAllWhitespace: true });
const MONGODB_URI = required("MONGODB_URI");

async function render(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${RENDER_API_KEY}`,
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...(options.headers || {})
    }
  });

  const text = await response.text();
  let body = null;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = text;
  }

  if (!response.ok) {
    const error = new Error(
      `Render API ${response.status} em ${path}: ${typeof body === "string" ? body : JSON.stringify(body)}`
    );
    error.status = response.status;
    error.body = body;
    throw error;
  }

  return body;
}

function unwrapOwner(item) {
  return item?.owner || item;
}

function unwrapService(item) {
  return item?.service || item;
}

function serviceUrl(service, fallbackName) {
  return (
    service?.serviceDetails?.url ||
    service?.url ||
    `https://${fallbackName}.onrender.com`
  );
}

async function getWorkspaceId() {
  if (process.env.RENDER_OWNER_ID?.trim()) return process.env.RENDER_OWNER_ID.trim();

  const result = await render("/owners?limit=20");
  const owners = (Array.isArray(result) ? result : [])
    .map(unwrapOwner)
    .filter((owner) => owner?.id);

  if (owners.length === 0) {
    throw new Error("A RENDER_API_KEY não retornou nenhum workspace.");
  }

  if (owners.length > 1) {
    console.log(
      `[render] ${owners.length} workspaces encontrados; usando ${owners[0].name || owners[0].id}. ` +
        "Se necessário, defina RENDER_OWNER_ID no workflow."
    );
  }

  return owners[0].id;
}

async function listServices() {
  const result = await render("/services?limit=100&includePreviews=false");
  return (Array.isArray(result) ? result : [])
    .map(unwrapService)
    .filter((service) => service?.id);
}

async function patchService(serviceId, payload) {
  return render(`/services/${serviceId}`, {
    method: "PATCH",
    body: JSON.stringify(payload)
  });
}

async function putEnv(serviceId, key, value) {
  await render(`/services/${serviceId}/env-vars/${encodeURIComponent(key)}`, {
    method: "PUT",
    body: JSON.stringify({ value })
  });
}

async function envExists(serviceId, key) {
  try {
    await render(`/services/${serviceId}/env-vars/${encodeURIComponent(key)}`);
    return true;
  } catch (error) {
    if (error.status === 404) return false;
    throw error;
  }
}

async function ensureRandomSecret(serviceId, key) {
  if (await envExists(serviceId, key)) return;
  const value = crypto.randomBytes(48).toString("hex");
  await putEnv(serviceId, key, value);
  console.log(`[render] ${key} criado no serviço ${serviceId}.`);
}

async function createApi(ownerId) {
  const frontendUrl = `https://${WEB_NAME}.onrender.com`;

  const payload = {
    type: "web_service",
    name: API_NAME,
    ownerId,
    repo: REPO,
    branch: BRANCH,
    rootDir: "backend",
    autoDeploy: "no",
    envVars: [
      { key: "NODE_ENV", value: "production" },
      { key: "MONGODB_URI", value: MONGODB_URI },
      { key: "JWT_SECRET", value: crypto.randomBytes(48).toString("hex") },
      { key: "QR_HMAC_SECRET", value: crypto.randomBytes(48).toString("hex") },
      { key: "FRONTEND_URL", value: frontendUrl },
      { key: "PAYMENT_WEBHOOK_SECRET", value: crypto.randomBytes(48).toString("hex") },
      { key: "COOKIE_SAME_SITE", value: "none" },
      { key: "PARTNER_JWT_EXPIRES_IN", value: "10h" },
      { key: "QR_TTL_SECONDS", value: "60" }
    ],
    serviceDetails: {
      runtime: "node",
      plan: "free",
      region: REGION,
      healthCheckPath: "/health",
      envSpecificDetails: {
        buildCommand: "npm install",
        startCommand: "npm start"
      }
    }
  };

  return unwrapService(
    await render("/services", {
      method: "POST",
      body: JSON.stringify(payload)
    })
  );
}

async function createWeb(ownerId, apiUrl) {
  const payload = {
    type: "static_site",
    name: WEB_NAME,
    ownerId,
    repo: REPO,
    branch: BRANCH,
    rootDir: "frontend",
    autoDeploy: "no",
    envVars: [{ key: "VITE_API_URL", value: apiUrl }],
    serviceDetails: {
      buildCommand: "npm install && npm run build",
      publishPath: "dist",
      routes: [{ type: "rewrite", source: "/*", destination: "/index.html" }]
    }
  };

  return unwrapService(
    await render("/services", {
      method: "POST",
      body: JSON.stringify(payload)
    })
  );
}

async function getService(serviceId) {
  return unwrapService(await render(`/services/${serviceId}`));
}

async function triggerDeploy(serviceId, commitId) {
  for (let attempt = 1; attempt <= 12; attempt += 1) {
    try {
      const payload = commitId ? { commitId } : {};
      const deploy = await render(`/services/${serviceId}/deploys`, {
        method: "POST",
        body: JSON.stringify(payload)
      });
      return deploy?.deploy || deploy;
    } catch (error) {
      if (error.status === 409 && attempt < 12) {
        console.log(`[render] deploy ocupado para ${serviceId}; aguardando 15s...`);
        await new Promise((resolve) => setTimeout(resolve, 15_000));
        continue;
      }
      throw error;
    }
  }
}

async function waitForUrl(url, label, attempts = 72) {
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const response = await fetch(url, { redirect: "follow" });
      if (response.ok) {
        console.log(`[render] ${label} online: ${url}`);
        return;
      }
      console.log(`[render] ${label} respondeu ${response.status}; tentativa ${attempt}/${attempts}.`);
    } catch (error) {
      console.log(`[render] aguardando ${label}: ${error.message}`);
    }
    await new Promise((resolve) => setTimeout(resolve, 10_000));
  }

  throw new Error(`${label} não ficou disponível dentro do tempo esperado: ${url}`);
}

async function main() {
  const ownerId = await getWorkspaceId();
  console.log(`[render] workspace: ${ownerId}`);

  let services = await listServices();
  let api = services.find((service) => service.name === API_NAME);

  if (!api) {
    console.log("[render] criando API Free...");
    api = await createApi(ownerId);
  } else {
    console.log(`[render] API existente: ${api.id}`);
    await patchService(api.id, {
      repo: REPO,
      branch: BRANCH,
      rootDir: "backend",
      autoDeploy: "no",
      serviceDetails: {
        runtime: "node",
        plan: "free",
        healthCheckPath: "/health",
        envSpecificDetails: {
          buildCommand: "npm install",
          startCommand: "npm start"
        }
      }
    });
  }

  api = await getService(api.id);
  const apiUrl = serviceUrl(api, API_NAME);

  await putEnv(api.id, "NODE_ENV", "production");
  await putEnv(api.id, "MONGODB_URI", MONGODB_URI);
  await putEnv(api.id, "COOKIE_SAME_SITE", "none");
  await putEnv(api.id, "PARTNER_JWT_EXPIRES_IN", "10h");
  await putEnv(api.id, "QR_TTL_SECONDS", "60");
  await ensureRandomSecret(api.id, "JWT_SECRET");
  await ensureRandomSecret(api.id, "QR_HMAC_SECRET");
  await ensureRandomSecret(api.id, "PAYMENT_WEBHOOK_SECRET");

  services = await listServices();
  let web = services.find((service) => service.name === WEB_NAME);

  if (!web) {
    console.log("[render] criando frontend estático...");
    web = await createWeb(ownerId, apiUrl);
  } else {
    console.log(`[render] frontend existente: ${web.id}`);
    await patchService(web.id, {
      repo: REPO,
      branch: BRANCH,
      rootDir: "frontend",
      autoDeploy: "no",
      serviceDetails: {
        buildCommand: "npm install && npm run build",
        publishPath: "dist"
      }
    });
  }

  web = await getService(web.id);
  const webUrl = serviceUrl(web, WEB_NAME);

  await putEnv(web.id, "VITE_API_URL", apiUrl);
  await putEnv(api.id, "FRONTEND_URL", webUrl);

  const commitId = process.env.GITHUB_SHA || undefined;
  console.log(`[render] disparando deploy da API ${commitId ? `(${commitId})` : ""}...`);
  await triggerDeploy(api.id, commitId);
  console.log("[render] disparando deploy do frontend...");
  await triggerDeploy(web.id, commitId);

  await waitForUrl(`${apiUrl}/health`, "API");
  await waitForUrl(webUrl, "Frontend");

  console.log("\n[render] deploy concluído");
  console.log(`API_URL=${apiUrl}`);
  console.log(`WEB_URL=${webUrl}`);

  if (process.env.GITHUB_OUTPUT) {
    const fs = await import("node:fs/promises");
    await fs.appendFile(
      process.env.GITHUB_OUTPUT,
      `api_url=${apiUrl}\nweb_url=${webUrl}\napi_service_id=${api.id}\nweb_service_id=${web.id}\n`
    );
  }
}

main().catch((error) => {
  console.error("[render] falha no deploy:", error);
  process.exitCode = 1;
});
