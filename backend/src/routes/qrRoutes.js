import { Router } from "express";
import { getMyQr } from "../controllers/qrController.js";
import { requireAuth } from "../middlewares/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const qrRouter = Router();

qrRouter.get(
  "/me",
  requireAuth,
  asyncHandler(getMyQr)
);
