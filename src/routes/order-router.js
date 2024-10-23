import { Router } from "express";
import { jwtMiddleware } from "../middlewares/jwt.js";
import orderController from "../controllers/order-controller.js";

export const orderRouter = new Router();

orderRouter.get('/', jwtMiddleware, orderController.getAllOrders)
orderRouter.post('/', orderController.makeOrder)
