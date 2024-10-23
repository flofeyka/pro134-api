import express from "express";
import config from "config";
import routes from "./src/routes/routes.js";
import { createServer } from "http";
import { initWebsocket } from "./src/lib/web-socket-init/index.js";
import { logger } from "./src/lib/logger/logger.js";
import bodyParser from "body-parser";
import cors from "cors";
import { productRouter } from "./src/routes/product-router.js";
import { feedbackRouter } from "./src/routes/feedback-router.js";
import { orderRouter } from "./src/routes/order-router.js";

const port = config.get("server.port");

//express
const app = express();
app.use(
  cors({
    origin: true,
  })
);
app.use(express.json());
app.use('/product', productRouter)
app.use('/feedback', feedbackRouter)
app.use('/order', orderRouter)
app.use(routes);
app.use(express.static("static"));

app.use((err, req, res, next) => {
  console.log(err);
  const { status = 500, message = 'Непредвиденная ошибка' } = err;
  res.status(status).json(message);
});

//node server
const server = createServer(app);

//socket.io
initWebsocket(server);

server.listen(port, () => logger.info(null, `Listening on port ${port}`));
