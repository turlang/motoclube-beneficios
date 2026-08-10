import { Router } from "express";
import {
  eventIdSchema,
  listAdminEventOperations,
  listEventParticipants,
  listMemberEvents,
  rsvpSchema,
  updateEventOperation,
  updateEventOperationSchema,
  updateRsvp
} from "../controllers/eventRouteController.js";
import { requireAuth } from "../middlewares/auth.js";
import { requireDiretoria } from "../middlewares/requireDiretoria.js";
import { validate } from "../middlewares/validate.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const eventRouter = Router();
eventRouter.use(requireAuth);
eventRouter.get("/", asyncHandler(listMemberEvents));
eventRouter.post("/:id/rsvp", validate(rsvpSchema), asyncHandler(updateRsvp));

export const eventAdminRouter = Router();
eventAdminRouter.use(requireAuth, requireDiretoria);
eventAdminRouter.get("/", asyncHandler(listAdminEventOperations));
eventAdminRouter.patch("/:id/operation", validate(updateEventOperationSchema), asyncHandler(updateEventOperation));
eventAdminRouter.get("/:id/participants", validate(eventIdSchema), asyncHandler(listEventParticipants));
