const http = require("http");
const express = require("express");
const cors = require("cors");
const app = express();
const ServerPort = process.env.PORT || 3000;
const server = http.createServer(app).listen(ServerPort, () => {
  console.log(`Server is running on port ${ServerPort}`);
});
const io = require("socket.io")(server);

app.use(cors());
// app.listen(3000, () => {
//   console.log("Server is running on port 3000");
// });

let connectedUsers = [];

//Socket on conneciton
io.on("connection", (socket) => {
  // console.log(sockets);
  console.log("New connection : " + socket.id);

  //Socket must knows all connected usres
  connectedUsers.push(socket.id);
  console.log("Connection length : " + connectedUsers.length);

  //socket must other users
  const otherUser = connectedUsers.filter((socketId) => socketId !== socket.id);

  //emit an event to myself for other user
  socket.emit("otherUser", otherUser);

  //Sending offer to start connection
  socket.on("offer", (socketId, description) => {
    console.log("Offer  : " + socketId);
    socket.to(socketId).emit("offer", socket.id, description);
  });

  //Sending answer to peer
  socket.on("answer", (socketId, description) => {
    console.log("Answer  : " + socketId);
    socket.to(socketId).emit("answer", socket.id, description);
  });

  //Sending singnals to establish a connection
  socket.on("candidate", (socketId, signal) => {
    console.log("Candidate  : " + socketId);
    socket.to(socketId).emit("candidate", signal);
  });

  //Removing user when socket is disconnected.
  socket.on("disconnect", () => {
    console.log("Disconnect : " + socket.id);
    connectedUsers = connectedUsers.filter(
      (socketId) => socketId !== socket.id
    );
  });
});
