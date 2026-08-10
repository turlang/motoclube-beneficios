import { Router } from "express";
import {
  adminOverview,
  changeMemberPatent,
  changeMemberStatus,
  changePatentSchema,
  changeStatusSchema,
  createBenefit,
  createBenefitSchema,
  createPartner,
  createPartnerSchema,
  listMembers,
  listPartners
} from "../controllers/adminController.js";
import {
  createChapter,
  createChapterSchema,
  createEvent,
  createEventSchema,
  createMedia,
  createMediaSchema,
  createOfficer,
  createOfficerSchema,
  createPost,
  createPostSchema,
  deleteChapter,
  deleteChapterSchema,
  deleteEvent,
  deleteEventSchema,
  deleteMedia,
  deleteMediaSchema,
  deleteOfficer,
  deleteOfficerSchema,
  deletePost,
  deletePostSchema,
  getClubContent,
  updateChapter,
  updateChapterSchema,
  updateClubProfile,
  updateClubProfileSchema,
  updateEvent,
  updateEventSchema,
  updateMedia,
  updateMediaSchema,
  updateOfficer,
  updateOfficerSchema,
  updatePost,
  updatePostSchema
} from "../controllers/clubAdminController.js";
import { requireAuth } from "../middlewares/auth.js";
import { requireDiretoria } from "../middlewares/requireDiretoria.js";
import { validate } from "../middlewares/validate.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const adminRouter = Router();

adminRouter.use(requireAuth, requireDiretoria);

adminRouter.get("/overview", asyncHandler(adminOverview));
adminRouter.get("/members", asyncHandler(listMembers));
adminRouter.get("/partners", asyncHandler(listPartners));
adminRouter.patch("/members/:id/patente", validate(changePatentSchema), asyncHandler(changeMemberPatent));
adminRouter.patch("/members/:id/status", validate(changeStatusSchema), asyncHandler(changeMemberStatus));
adminRouter.post("/partners", validate(createPartnerSchema), asyncHandler(createPartner));
adminRouter.post("/benefits", validate(createBenefitSchema), asyncHandler(createBenefit));

adminRouter.get("/club/content", asyncHandler(getClubContent));
adminRouter.patch("/club/profile", validate(updateClubProfileSchema), asyncHandler(updateClubProfile));

adminRouter.post("/club/officers", validate(createOfficerSchema), asyncHandler(createOfficer));
adminRouter.patch("/club/officers/:id", validate(updateOfficerSchema), asyncHandler(updateOfficer));
adminRouter.delete("/club/officers/:id", validate(deleteOfficerSchema), asyncHandler(deleteOfficer));

adminRouter.post("/club/events", validate(createEventSchema), asyncHandler(createEvent));
adminRouter.patch("/club/events/:id", validate(updateEventSchema), asyncHandler(updateEvent));
adminRouter.delete("/club/events/:id", validate(deleteEventSchema), asyncHandler(deleteEvent));

adminRouter.post("/club/posts", validate(createPostSchema), asyncHandler(createPost));
adminRouter.patch("/club/posts/:id", validate(updatePostSchema), asyncHandler(updatePost));
adminRouter.delete("/club/posts/:id", validate(deletePostSchema), asyncHandler(deletePost));

adminRouter.post("/club/chapters", validate(createChapterSchema), asyncHandler(createChapter));
adminRouter.patch("/club/chapters/:id", validate(updateChapterSchema), asyncHandler(updateChapter));
adminRouter.delete("/club/chapters/:id", validate(deleteChapterSchema), asyncHandler(deleteChapter));

adminRouter.post("/club/media", validate(createMediaSchema), asyncHandler(createMedia));
adminRouter.patch("/club/media/:id", validate(updateMediaSchema), asyncHandler(updateMedia));
adminRouter.delete("/club/media/:id", validate(deleteMediaSchema), asyncHandler(deleteMedia));
