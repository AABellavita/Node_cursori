// load express library
let express = require("express");

// create the app
let app = express();

// define the port where client files will be provided
let port = process.env.PORT || 3000;

// start to listen to that port
let server = app.listen(port);

// provide static access to the files
// in the "public" folder
app.use(express.static("public"));

// load socket library
let socket = require("socket.io");

// create a socket connection
let io = socket(server);

// define which function should be called
// when a new connection is opened from client
io.on("connection", newConnection);

// callback function: the paramenter (in this case socket)
// will contain all the information on the new connection
function newConnection(socket) {
  //when a new connection is created, print its id
  console.log("socket: ", socket.id);

  socket.on("mouse", function(data) {
    var mouseData = {
      x: data.x,
      y: data.y,
      width: data.width,
      height: data.height,
      id: socket.id,
    }
    socket.broadcast.emit("mouseBroadcast", mouseData);
    console.log(socket.client.id, data);
  });

  socket.on("disconnect", function() {
    var socketData = {
      id: socket.id,
    }
    socket.broadcast.emit("deleteCursor", socketData);
  });
}

console.log("node server is running");
