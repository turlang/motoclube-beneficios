import { Router } from "express";
import {
  createMyService,
  createServiceSchema,
  getFleetOverview,
  getMyMotorcycle,
  updateMotorcycleProfileSchema,
  updateMyMotorcycle,
  updateMyReminder,
  updateReminderSchema
} from "../controllers/motorcycleController.js";
import { requireAuth } from "../middlewares/auth.js";
import { requireDiretoria } from "../middlewares/requireDiretoria.js";
import { validate } from "../middlewares/validate.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const motorcycleRouter = Router();
export const motorcycleAdminRouter = Router();

motorcycleRouter.use(requireAuth);
motorcycleRouter.get("/me", asyncHandler(getMyMotorcycle));
motorcycleRouter.patch("/me", validate(updateMotorcycleProfileSchema), asyncHandler(updateMyMotorcycle));
motorcycleRouter.patch("/me/reminders/:key", validate(updateReminderSchema), asyncHandler(updateMyReminder));
motorcycleRouter.post("/me/services", validate(createServiceSchema), asyncHandler(createMyService));

motorcycleAdminRouter.use(requireAuth, requireDiretoria);
motorcycleAdminRouter.get("/overview", asyncHandler(getFleetOverview));
