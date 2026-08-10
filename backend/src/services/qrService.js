import crypto from "node:crypto";

function getQrSecret() {
  if (!process.env.QR_HMAC_SECRET) {
    throw new Error("QR_HMAC_SECRET não configurado.");
  }

  return process.env.QR_HMAC_SECRET;
}

function getTtlSeconds() {
  const parsed = Number(process.env.QR_TTL_SECONDS || 60);
  return Number.isFinite(parsed) && parsed >= 15 ? parsed : 60;
}

function createSignature(userId, expiresAt, userQrSecret) {
  return crypto
    .createHmac("sha256", getQrSecret())
    .update(`${userId}.${expiresAt}.${userQrSecret}`)
    .digest("base64url");
}

export function createDynamicQrToken(user) {
  const ttl = getTtlSeconds();
  const nowSeconds = Math.floor(Date.now() / 1000);
  const expiresAt = (Math.floor(nowSeconds / ttl) + 1) * ttl;

  const payload = {
    uid: user._id.toString(),
    exp: expiresAt
  };

  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = createSignature(payload.uid, expiresAt, user.qrCodeToken);

  return {
    token: `${encodedPayload}.${signature}`,
    expiresAt
  };
}

export function parseDynamicQrToken(token) {
  if (!token || typeof token !== "string") {
    throw new Error("QR_TOKEN_INVALID");
  }

  const parts = token.split(".");
  if (parts.length !== 2) {
    throw new Error("QR_TOKEN_INVALID");
  }

  const [encodedPayload, receivedSignature] = parts;
  let payload;

  try {
    payload = JSON.parse(Buffer.from(encodedPayload, "base64url").toString("utf8"));
  } catch {
    throw new Error("QR_TOKEN_INVALID");
  }

  if (!payload?.uid || !Number.isInteger(payload.exp)) {
    throw new Error("QR_TOKEN_INVALID");
  }

  return { payload, receivedSignature };
}

export function verifyDynamicQrTokenForUser(token, user) {
  const { payload, receivedSignature } = parseDynamicQrToken(token);
  const nowSeconds = Math.floor(Date.now() / 1000);

  if (payload.uid !== user._id.toString()) {
    return { valid: false, reason: "user_mismatch" };
  }

  if (payload.exp <= nowSeconds) {
    return { valid: false, reason: "expired" };
  }

  const expectedSignature = createSignature(payload.uid, payload.exp, user.qrCodeToken);
  const receivedBuffer = Buffer.from(receivedSignature);
  const expectedBuffer = Buffer.from(expectedSignature);

  if (receivedBuffer.length !== expectedBuffer.length) {
    return { valid: false, reason: "invalid_signature" };
  }

  const validSignature = crypto.timingSafeEqual(receivedBuffer, expectedBuffer);
  if (!validSignature) {
    return { valid: false, reason: "invalid_signature" };
  }

  if (user.patente === "Candidato") {
    return { valid: false, reason: "candidate_not_approved" };
  }

  if (user.statusAssinatura !== "ativo") {
    return { valid: false, reason: "inactive_subscription" };
  }

  return {
    valid: true,
    expiresAt: payload.exp
  };
}
