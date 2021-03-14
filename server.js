const http = require("http");
const express = require("express");
const cors = require("cors");
const app = express();
const server = http.createServer(app).listen(3000, () => {
  console.log("Server is running on port 3000");
});
const io = require("socket.io")(server);

app.use(cors());

let connectedUsers = [];

//Socket on conneciton
io.on("connection", (socket) => {
  //Socket must knows all connected usres
  connectedUsers.push(socket.id);

  //socket must other users
  const otherUser = connectedUsers.filter((socketId) => socketId !== socket.id);

  //emit an event to myself for other user
  socket.emit("ohterUser", otherUser);

  //Sending offer to start connection
  socket.on("offer", (socketId, description) => {
    socket.to(socketId).emit("Offer", socket.id, description);
  });

  //Sending answer to peer
  socket.on("answer", (socketId, description) => {
    socket.to(socketId).emit("answer", socket.id, description);
  });

  //Sending singnals to establish a connection
  socket.on("candidate", (socketId, signal) => {
    socket.to(socketId).emit("candidate", signal);
  });

  //Removing user when socket is disconnected.
  socket.on("disconnect", () => {
    connectedUsers = connectedUsers.filter(
      (socketId) => socketId !== socket.id
    );
  });
});
