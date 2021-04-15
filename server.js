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

//Socket on conneciton
io.on("connection", (socket) => {
  // console.log(sockets);
  console.log("New connection : " + socket.id);

  //Sending active room list
  socket.on("getRoomList", () => {
    var list = [123, 345, 456, 678];
    // console.log("room list :" + list);
    socket.emit("roomList", list);
  });

  //When a user click join
  socket.on("join", (roomId) => {
    console.log(
      `${socket.id} join event is raised on roomId ${roomId} ...........`
    );

    var rooms = io.sockets.adapter.rooms;
    console.log(rooms);

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

  socket.on("disjoin", (roomId) => {});

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
  });
});
