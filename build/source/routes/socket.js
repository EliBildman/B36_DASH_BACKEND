"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEvent = exports.setupSocketRoute = void 0;
const socket_io_1 = require("socket.io");
let io;
const setupSocketRoute = (server) => {
    io = new socket_io_1.Server(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"],
        },
    });
    // io.on("connection", (socket) => {
    //   console.log("connection");
    //   socket.on("disconnect", () => {
    //     console.log("user disconnected");
    //   });
    // });
};
exports.setupSocketRoute = setupSocketRoute;
const sendEvent = (event) => {
    // console.log(`send socket event: ${event}`)
    io.emit("run", event);
};
exports.sendEvent = sendEvent;
