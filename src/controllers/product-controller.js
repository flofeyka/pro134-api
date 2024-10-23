import ctrlWrapper from "../decorators/ctrlWrapper.js";
import { RequestProductDto } from "../dtos/RequestProductDto.js";
import productService from "../services/product-service.js";


const getAllProducts = async (req, res) => {
  const products = await productService.getAllProducts();
  res.json(products);
};

const getAllProductsWithStopped = async (req, res) => {
  const products = await productService.getAllProductsWithStopped();
  res.json(products);
};

const getOneProductWithStopped = async (req, res) => {
  const productFound = await productService.getOneProductWithStopped(
    req.params.id
  );
  return res.json(productFound);
};

const getOneProduct = async (req, res) => {
  const result = await productService.getProductById(req.params.id);
  res.json(result);
};

const getPopularProducts = async (req, res) => {
  const result = await productService.getPopularProducts();
  res.json(result);
};

const addProduct = async (req, res) => {
  const result = await productService.addProduct(req.files.photos, req.files.pdf, new RequestProductDto(req.body));
  res.status(201).json(result);
};

const deleteProduct = async (req, res) => {
  const deleteResult = await productService.deleteProduct(req.params.id);

  return res.sendStatus(200).json(deleteResult);
};

const stopProduct = async (req, res) => {
  const {id} = req.params;
  const {value} = req.body;

  const stoppedResult = await productService.stopProduct({id, value});
  res.json(stoppedResult);
};

const editProduct = async (req, res) => {
  const id = req.params.id;
  console.log(req.files);
  const editResult = await productService.editProduct(id, new RequestProductDto(req.body), req.files?.pdf, req.files?.photos);

  res.status(200).json(editResult);
};

export default {
  getAllProducts: ctrlWrapper(getAllProducts),
  getAllProductsWithStopped: ctrlWrapper(getAllProductsWithStopped),
  getOneProduct: ctrlWrapper(getOneProduct),
  getOneProductWithStopped: ctrlWrapper(getOneProductWithStopped),
  getPopularProducts: ctrlWrapper(getPopularProducts),
  addProduct: ctrlWrapper(addProduct),
  deleteProduct: ctrlWrapper(deleteProduct),
  stopProduct: ctrlWrapper(stopProduct),
  editProduct: ctrlWrapper(editProduct)
}