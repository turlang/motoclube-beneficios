import { Router } from "express";
import {
  login,
  loginSchema,
  logout,
  me,
  register,
  registerSchema
} from "../controllers/authController.js";
import { requireAuth } from "../middlewares/auth.js";
import {
  loginLimiter,
  registerLimiter
} from "../middlewares/rateLimits.js";
import { validate } from "../middlewares/validate.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const authRouter = Router();

authRouter.post(
  "/register",
  registerLimiter,
  validate(registerSchema),
  asyncHandler(register)
);

authRouter.post(
  "/login",
  loginLimiter,
  validate(loginSchema),
  asyncHandler(login)
);

authRouter.post(
  "/logout",
  requireAuth,
  asyncHandler(logout)
);

authRouter.get(
  "/me",
  requireAuth,
  asyncHandler(me)
);
