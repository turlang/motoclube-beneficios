import mongoose from "mongoose";

export async function connectDatabase() {
  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI não configurada.");
  }

  mongoose.set("strictQuery", true);

  await mongoose.connect(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 10_000
  });

  console.log("[database] MongoDB conectado");
}
