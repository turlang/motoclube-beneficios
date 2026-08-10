import { Router } from "express";
import { getClubHome } from "../controllers/clubController.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const clubRouter = Router();

clubRouter.get("/home", asyncHandler(getClubHome));
