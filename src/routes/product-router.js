import { Router } from "express";
import { jwtMiddleware } from "../middlewares/jwt.js";
import productController from "../controllers/product-controller.js";
import multer from "multer";

export const productRouter = new Router();
const upload = multer();

productRouter.get("/", productController.getAllProducts);

//продукты + остановленные
productRouter.get("/all", jwtMiddleware, productController.getAllProductsWithStopped);
productRouter.get(
  "/:id/with-stopped",
  jwtMiddleware,
  productController.getOneProductWithStopped
);

productRouter.get("/popular", productController.getPopularProducts);
productRouter.get("/:id", productController.getOneProduct);

productRouter.post(
  "/",
  upload.fields([{ name: "pdf" }, { name: "photos" }]),
  productController.addProduct
);
productRouter.put(
  "/:id",
  jwtMiddleware,
  upload.fields([{ name: "pdf" }, { name: "photos" }]),
  productController.editProduct
);

productRouter.delete("/:id", jwtMiddleware, productController.deleteProduct);
productRouter.put("/:id/stop", jwtMiddleware, productController.stopProduct);
