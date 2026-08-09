import { Router } from "express";
import {
  paymentWebhook,
  paymentWebhookSchema
} from "../controllers/paymentController.js";
import { requireWebhookSecret } from "../middlewares/webhookAuth.js";
import { validate } from "../middlewares/validate.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const paymentRouter = Router();

paymentRouter.post(
  "/webhook",
  requireWebhookSecret,
  validate(paymentWebhookSchema),
  asyncHandler(paymentWebhook)
);
