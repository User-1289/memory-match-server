const express = require('express');
const path = require('path');
const app = express();
const cors = require('cors');

const http = require('http').createServer(app);
const { Server } = require("socket.io");

const io = new Server(http);

app.use(cors());
app.use(express.json());

io.on("connect_error", (err) => {
  console.log(`connect_error due to ${err.message}`);
});


app.get('/', (req, res) => {
  console.log('giefw');
  res.send('Hello World!'); // Send a response to the client

})
io.on('connection', (socket) => {
  console.log('A user connected');

  // Handle disconnection event
  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});

// Start the server
const port = process.env.PORT || 8000;
http.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

