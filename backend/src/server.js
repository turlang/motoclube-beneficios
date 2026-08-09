import "dotenv/config";
import http from "node:http";
import mongoose from "mongoose";
import { app } from "./app.js";
import { connectDatabase } from "./config/db.js";

const port = Number(process.env.PORT || 3001);
const server = http.createServer(app);

async function bootstrap() {
  await connectDatabase();

  server.listen(port, "0.0.0.0", () => {
    console.log(`[server] API disponível na porta ${port}`);
  });
}

async function shutdown(signal) {
  console.log(`[server] Recebido ${signal}. Encerrando...`);

  server.close(async () => {
    await mongoose.connection.close();
    process.exit(0);
  });

  setTimeout(() => {
    process.exit(1);
  }, 10_000).unref();
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

bootstrap().catch((error) => {
  console.error("[bootstrap] Falha ao iniciar:", error);
  process.exit(1);
});
