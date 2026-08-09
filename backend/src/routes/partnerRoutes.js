import { Router } from "express";
import { z } from "zod";
import { validatePartnerQr } from "../controllers/qrController.js";
import { requirePartnerSession } from "../middlewares/partnerSession.js";
import { qrValidationLimiter } from "../middlewares/rateLimits.js";
import { validate } from "../middlewares/validate.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const validateQrSchema = z.object({
  body: z.object({
    token: z.string().min(10).max(2048)
  }),
  params: z.object({}).passthrough(),
  query: z.object({}).passthrough()
});

export const partnerRouter = Router();

partnerRouter.post(
  "/qr/validate",
  requirePartnerSession,
  qrValidationLimiter,
  validate(validateQrSchema),
  asyncHandler(validatePartnerQr)
);
