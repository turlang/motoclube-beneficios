import { Router } from "express";
import {
  acknowledgeAnnouncement,
  announcementIdSchema,
  createAnnouncement,
  createAnnouncementSchema,
  deleteAnnouncement,
  listAdminCommunications,
  listMemberCommunications,
  markAnnouncementRead,
  updateAnnouncement,
  updateAnnouncementSchema
} from "../controllers/communicationController.js";
import { requireAuth } from "../middlewares/auth.js";
import { requireDiretoria } from "../middlewares/requireDiretoria.js";
import { validate } from "../middlewares/validate.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const communicationRouter = Router();
communicationRouter.use(requireAuth);
communicationRouter.get("/", asyncHandler(listMemberCommunications));
communicationRouter.post("/:id/read", validate(announcementIdSchema), asyncHandler(markAnnouncementRead));
communicationRouter.post("/:id/ack", validate(announcementIdSchema), asyncHandler(acknowledgeAnnouncement));

export const communicationAdminRouter = Router();
communicationAdminRouter.use(requireAuth, requireDiretoria);
communicationAdminRouter.get("/", asyncHandler(listAdminCommunications));
communicationAdminRouter.post("/", validate(createAnnouncementSchema), asyncHandler(createAnnouncement));
communicationAdminRouter.patch("/:id", validate(updateAnnouncementSchema), asyncHandler(updateAnnouncement));
communicationAdminRouter.delete("/:id", validate(announcementIdSchema), asyncHandler(deleteAnnouncement));
