const http = require("http");
const express = require("express");
const cors = require("cors");
const app = express();
const ServerPort = process.env.PORT || 3000;
const server = http.createServer(app).listen(ServerPort, "192.168.1.2", () => {
  console.log(`Server is running on port ${ServerPort}`);
});
const io = require("socket.io")(server);

app.use(cors());
// app.listen(3000, () => {
//   console.log("Server is running on port 3000");
// });

let connectedUsers = [];
let userCount = 0;
//Socket on conneciton
io.on("connection", (socket) => {
  // console.log(sockets);
  console.log("New connection : " + socket.id);

  // //Socket must knows all connected usres
  // connectedUsers.push(socket.id);
  // console.log("Connection length : " + connectedUsers.length);

  // //socket must other users
  // const otherUser = connectedUsers.filter((socketId) => socketId !== socket.id);

  //Sending active room list
  socket.on("getRoomList", () => {
    var list = [123, 345, 456, 678];
    // console.log("room list :" + list);
    socket.emit("roomList", list);
  });

  socket.on("join", (roomId) => {
    console.log(
      `${socket.id} join event is raised on roomId ${roomId} ...........`
    );

    userCount = connectedUsers.filter((user) => user.room == roomId);
    console.log(
      `userCount of ${connectedUsers.length} is : ${userCount.length}`
    );

    if (userCount.length == 2) {
      console.log(`room ${roomId} is full for user : ${socket.id}`);
      socket.emit("roomFull", roomId);
    } else if (userCount.length == 1 || userCount.length == 0) {
      var user = { username: socket.id, room: roomId };
      console.log(`username is : ${user.username} & room : ${user.room}`);
      connectedUsers.push(user);
      socket.join(roomId);

      io.sockets
        .in(roomId)
        .emit("joined", { username: user.username, room: user.room });
    }
  });

  socket.on("disjoin", (roomId) => {
    var user = connectedUsers.filter(
      (user) => user.room == roomId && user.username == socket.id
    );
    if (user) {
      socket.leave(roomId);
      io.sockets
        .in(roomId)
        .emit("leaved", { username: user.username, room: user.room });
    }
  });

  // //emit an event to myself for other user
  // socket.emit("otherUser", otherUser);

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
