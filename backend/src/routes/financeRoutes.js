import { Router } from "express";
import {
  createFinanceTransaction,
  createFinanceTransactionSchema,
  generateChargesSchema,
  generateMonthlyCharges,
  getFinanceOverview,
  getMyFinance,
  updateChargeSchema,
  updateFinanceSettings,
  updateFinanceSettingsSchema,
  updateMembershipCharge
} from "../controllers/financeController.js";
import { requireAuth } from "../middlewares/auth.js";
import { requireDiretoria } from "../middlewares/requireDiretoria.js";
import { validate } from "../middlewares/validate.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const financeRouter = Router();
export const financeAdminRouter = Router();

financeRouter.use(requireAuth);
financeRouter.get("/me", asyncHandler(getMyFinance));

financeAdminRouter.use(requireAuth, requireDiretoria);
financeAdminRouter.get("/overview", asyncHandler(getFinanceOverview));
financeAdminRouter.patch("/settings", validate(updateFinanceSettingsSchema), asyncHandler(updateFinanceSettings));
financeAdminRouter.post("/charges/generate", validate(generateChargesSchema), asyncHandler(generateMonthlyCharges));
financeAdminRouter.patch("/charges/:id", validate(updateChargeSchema), asyncHandler(updateMembershipCharge));
financeAdminRouter.post("/transactions", validate(createFinanceTransactionSchema), asyncHandler(createFinanceTransaction));
