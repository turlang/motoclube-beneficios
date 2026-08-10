import express from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";

import { authRouter } from "./routes/authRoutes.js";
import { qrRouter } from "./routes/qrRoutes.js";
import { partnerRouter } from "./routes/partnerRoutes.js";
import { adminRouter } from "./routes/adminRoutes.js";
import { paymentRouter } from "./routes/paymentRoutes.js";
import { benefitRouter } from "./routes/benefitRoutes.js";
import { partnerAuthRouter } from "./routes/partnerAuthRoutes.js";
import { clubRouter } from "./routes/clubRoutes.js";
import { eventAdminRouter, eventRouter } from "./routes/eventRoutes.js";
import { communicationAdminRouter, communicationRouter } from "./routes/communicationRoutes.js";
import { journeyAdminRouter, journeyRouter } from "./routes/journeyRoutes.js";
import { documentAdminRouter, documentRouter } from "./routes/documentRoutes.js";
import { motorcycleAdminRouter, motorcycleRouter } from "./routes/motorcycleRoutes.js";
import { financeAdminRouter, financeRouter } from "./routes/financeRoutes.js";
import { errorHandler, notFoundHandler } from "./middlewares/errorHandler.js";

export const app = express();

if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
}

app.disable("x-powered-by");

app.use(
  helmet({
    crossOriginResourcePolicy: {
      policy: "same-site"
    }
  })
);

const allowedOrigin = process.env.FRONTEND_URL;

if (!allowedOrigin) {
  throw new Error("FRONTEND_URL não configurada.");
}

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) return callback(null, true);
      if (origin === allowedOrigin) return callback(null, true);
      return callback(new Error("Origem bloqueada pela política CORS."));
    },
    credentials: true,
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "x-partner-key", "x-webhook-secret"]
  })
);

app.use(express.json({ limit: "100kb" }));
app.use(cookieParser());

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    service: "motoclube-beneficios-api",
    timestamp: new Date().toISOString()
  });
});

app.use("/api/auth", authRouter);
app.use("/api/club", clubRouter);
app.use("/api/events", eventRouter);
app.use("/api/communications", communicationRouter);
app.use("/api/journey", journeyRouter);
app.use("/api/documents", documentRouter);
app.use("/api/motorcycle", motorcycleRouter);
app.use("/api/finance", financeRouter);
app.use("/api/benefits", benefitRouter);
app.use("/api/partner/auth", partnerAuthRouter);
app.use("/api/qr", qrRouter);
app.use("/api/partner", partnerRouter);
app.use("/api/admin/events", eventAdminRouter);
app.use("/api/admin/communications", communicationAdminRouter);
app.use("/api/admin/journey", journeyAdminRouter);
app.use("/api/admin/documents", documentAdminRouter);
app.use("/api/admin/motorcycles", motorcycleAdminRouter);
app.use("/api/admin/finance", financeAdminRouter);
app.use("/api/admin", adminRouter);
app.use("/api/payments", paymentRouter);

app.use(notFoundHandler);
app.use(errorHandler);
