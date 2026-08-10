import { Router } from "express";
import {
  getAdminJourney,
  getMyJourney,
  journeyMemberSchema,
  promoteMember,
  promoteMemberSchema,
  updateAdminJourney,
  updateJourneySchema,
  updateRequirement,
  updateRequirementSchema
} from "../controllers/journeyController.js";
import { requireAuth } from "../middlewares/auth.js";
import { requireDiretoria } from "../middlewares/requireDiretoria.js";
import { validate } from "../middlewares/validate.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const journeyRouter = Router();
journeyRouter.use(requireAuth);
journeyRouter.get("/me", asyncHandler(getMyJourney));

export const journeyAdminRouter = Router();
journeyAdminRouter.use(requireAuth, requireDiretoria);
journeyAdminRouter.get("/:id", validate(journeyMemberSchema), asyncHandler(getAdminJourney));
journeyAdminRouter.patch("/:id", validate(updateJourneySchema), asyncHandler(updateAdminJourney));
journeyAdminRouter.patch("/:id/requirements/:key", validate(updateRequirementSchema), asyncHandler(updateRequirement));
journeyAdminRouter.post("/:id/promote", validate(promoteMemberSchema), asyncHandler(promoteMember));
