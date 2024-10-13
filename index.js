import express from 'express';
import config from 'config';
import routes from "./src/routes/routes.js";
import {createServer} from 'http'
import {initWebsocket} from "./src/lib/web-socket-init/index.js";
import {logger} from "./src/lib/logger/logger.js";
import bodyParser from 'body-parser';

const port = config.get('server.port');

//express
const app = express();
app.use(routes)
app.use(express.static('static'));
app.use(express.json());

//node server
const server = createServer(app)

//socket.io
initWebsocket(server)

server.listen(port, () => logger.info(null, `Listening on port ${port}`));
