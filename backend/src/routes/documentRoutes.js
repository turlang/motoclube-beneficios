import { Router } from "express";
import {
  acceptDocument,
  createDocument,
  createDocumentSchema,
  deleteDocument,
  documentIdSchema,
  getMemberDocument,
  listAdminDocuments,
  listDocumentAcceptances,
  listMemberDocuments,
  updateDocument,
  updateDocumentSchema
} from "../controllers/documentController.js";
import { requireAuth } from "../middlewares/auth.js";
import { requireDiretoria } from "../middlewares/requireDiretoria.js";
import { validate } from "../middlewares/validate.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const documentRouter = Router();
export const documentAdminRouter = Router();

documentRouter.use(requireAuth);
documentRouter.get("/", asyncHandler(listMemberDocuments));
documentRouter.get("/:id", validate(documentIdSchema), asyncHandler(getMemberDocument));
documentRouter.post("/:id/accept", validate(documentIdSchema), asyncHandler(acceptDocument));

documentAdminRouter.use(requireAuth, requireDiretoria);
documentAdminRouter.get("/", asyncHandler(listAdminDocuments));
documentAdminRouter.get("/:id/acceptances", validate(documentIdSchema), asyncHandler(listDocumentAcceptances));
documentAdminRouter.post("/", validate(createDocumentSchema), asyncHandler(createDocument));
documentAdminRouter.patch("/:id", validate(updateDocumentSchema), asyncHandler(updateDocument));
documentAdminRouter.delete("/:id", validate(documentIdSchema), asyncHandler(deleteDocument));
