import { Router } from "express";
import {
  partnerLogin,
  partnerLoginSchema,
  partnerLogout,
  partnerMe,
  partnerRecentValidations
} from "../controllers/partnerController.js";
import { loginLimiter } from "../middlewares/rateLimits.js";
import { requirePartnerSession } from "../middlewares/partnerSession.js";
import { validate } from "../middlewares/validate.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const partnerAuthRouter = Router();

partnerAuthRouter.post("/login", loginLimiter, validate(partnerLoginSchema), asyncHandler(partnerLogin));
partnerAuthRouter.post("/logout", requirePartnerSession, asyncHandler(partnerLogout));
partnerAuthRouter.get("/me", requirePartnerSession, asyncHandler(partnerMe));
partnerAuthRouter.get("/validations", requirePartnerSession, asyncHandler(partnerRecentValidations));
