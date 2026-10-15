'use strict';

const socketIO = require('socket.io');
const express = require('express');
const path = require('path');
const app = module.exports.app = express();
const port = process.env.PORT || 3000;

app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname, '/index.html'));
});

app.use(express.static(path.join(__dirname, 'public')));

const server = app.listen(port, () => {
  console.log("Listening on port: " + port);
});

const io = socketIO(server);

let placedDecorations = [];

let candleLit = false;

io.on('connection', (socket) => {
  console.log("New participant:", socket.id);

  socket.emit("decorations", placedDecorations);

  socket.emit("candleState", candleLit);

  socket.on("decoration", (arg) => {
    arg.id = Date.now() + Math.random();
    placedDecorations.push(arg);
    console.log("Saved decorations:", placedDecorations);
    io.emit("decorations", placedDecorations);
    if (arg.isBad) {
      console.log("Bad decoration placed:", arg);
      io.emit("badDecorationAdded");
    }
  
  });

  socket.on("toggleCandle", () => {
    candleLit = !candleLit;
    console.log("Candle lit:", candleLit);
    io.emit("candleState", candleLit);
  });

  socket.on("resetCake", () => {
    placedDecorations = [];
    console.log("Cake reset");
    io.emit("decorations", placedDecorations);
  });
  
});
