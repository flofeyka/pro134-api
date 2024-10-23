import { Router } from "express";
import { feedback } from "../controllers/feedback-controller.js";

export const feedbackRouter = new Router();

feedbackRouter.post('/', feedback)
