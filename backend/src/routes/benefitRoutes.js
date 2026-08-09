import { Router } from "express";
import { listBenefits } from "../controllers/benefitController.js";
import { requireAuth } from "../middlewares/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const benefitRouter = Router();

benefitRouter.get("/", requireAuth, asyncHandler(listBenefits));
