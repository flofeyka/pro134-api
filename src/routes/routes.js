import cookieParser from "cookie-parser";
import express, { Router } from 'express';
import multer from 'multer';
import { checkAuth, login } from "../controllers/auth-controller.js";
import { feedback } from "../controllers/feedback-controller.js";
import { getAllOrders, makeOrder } from "../controllers/order-controller.js";
import {
    addProduct,
    deleteProduct, editProduct,
    getAllProducts, getAllProductsWithStopped,
    getOneProduct, getOneProductWithStopped, getPopularProducts,
    stopProduct
} from "../controllers/product-controller.js";
import { jwtMiddleware } from "../middlewares/jwt.js";

const upload = multer();
const router = Router();

router.use(cookieParser());

//продукт
router.get('/product', getAllProducts)

//продукты + остановленные
router.get('/product/all', jwtMiddleware, getAllProductsWithStopped)
router.get('/product/:id/with-stopped', jwtMiddleware, getOneProductWithStopped)

router.get('/product/popular', getPopularProducts)
router.get('/product/:id', getOneProduct)

router.post('/product', upload.fields([{name: 'pdf'}, {name: 'photos'}]), express.json(), addProduct)
router.put('/product/:id', upload.fields([{name: 'pdf'}, {name: 'photos'}]),  express.json(), editProduct)

router.delete('/product/:id', jwtMiddleware, deleteProduct)
router.put('/product/:id/stop', jwtMiddleware, express.json(), stopProduct)

//авторизация
router.post("/login", express.json(), login)
router.get('/check-auth', jwtMiddleware, checkAuth)

//заказ
router.get('/order', jwtMiddleware, getAllOrders)
router.post('/order', express.json(), makeOrder)

//обратная связь
router.post('/feedback', express.json(), feedback)

export default router;