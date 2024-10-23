import ctrlWrapper from "../decorators/ctrlWrapper.js";
import orderService from "../services/order-service.js";

const getAllOrders = async (req, res) => {
    const orders = await orderService.getAllOrders();
    return res.json(orders)
}

const makeOrder = async (req, res) => {
    const newOrder = await orderService.makeOrder({...req.body});
    return res.status(newOrder.success ? 201 : 400).json(newOrder);
}

export default {
    getAllOrders: ctrlWrapper(getAllOrders),
    makeOrder: ctrlWrapper(makeOrder)
}