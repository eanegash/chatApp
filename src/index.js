const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');


const app = express();
const server = http.createServer(app);
const io = socketio(server);

const port = process.env.PORT || 3000;
const publicDirectoryPath = path.join(__dirname, '../public');

app.use(express.static(publicDirectoryPath));

//server(emit) -> client (receive) 
//client(emit) -> server (receive)
io.on('connection', (socket) => {
    console.log("New WebSocket Connection")

    socket.emit('message', 'Hello!');
    socket.broadcast.emit('message', 'New User Joined')

    socket.on('sendMessage', (message) => {
        io.emit('message', message);
    });

    socket.on('disconnect', () => {
        io.emit('message', 'User Has Left.')
    });
});

server.listen(port, () => {
    console.log('Server is on port ' + port);
});