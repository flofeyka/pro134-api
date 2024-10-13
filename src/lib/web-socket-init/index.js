import {Server} from "socket.io";
import {logger} from "../logger/logger.js";

export const initWebsocket = (server) => {
    let yesterdayConnections = 0
    const todayConnections = new Set()

    const io = new Server(server, {
        cors: {
            origin: `*`,
        }
    })

    io.on('connection', (socket) => {
        todayConnections.add(socket.id)
        logger.info(socket.handshake.address, 'a user connected')

        ///TODO: поработать над изменением значения подключений
        io.emit('get-active-connections', io.sockets.sockets.size)

        socket.on('disconnect', (reason, details) => {
            io.emit('get-active-connections', io.sockets.sockets.size)
            logger.info(reason, 'a user disconnected');
        })

        io.emit('get-yesterday-connections', yesterdayConnections)
    })

    setInterval(() => {
        //обновляем количество вчерашних и сегодняшних подключений
        yesterdayConnections = todayConnections.size
        todayConnections.clear()
        io.emit('get-yesterday-connections', yesterdayConnections)
    }, 86400000 /* 24 часа */)
}

