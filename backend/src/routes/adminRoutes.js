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
