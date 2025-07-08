import { Server as SocketIOServer, Socket } from "socket.io";
import http from "http";

let io: SocketIOServer;

export const setupSocketRoute = (server: http.Server) => {
  io = new SocketIOServer(server, {
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

export const sendEvent = (event: string) => {
  // console.log(`send socket event: ${event}`)
  io.emit("run", event);
};
