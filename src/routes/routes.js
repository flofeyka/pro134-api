import cookieParser from "cookie-parser";
import express, { Router } from 'express';
import { jwtMiddleware } from "../middlewares/jwt.js";
import authController from "../controllers/auth-controller.js";

const router = Router();

router.use(cookieParser());

//авторизация
router.post("/login", express.json(), authController.login)
router.get('/check-auth', jwtMiddleware, authController.checkAuth)

//заказ

//обратная связь

export default router;