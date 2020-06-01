const path = require('path');
const http = require('http');
const socketio = require('socket.io');
const express = require('express');


const app = express();
const server = http.createServer(app);
const io = socketio(server);

const port = process.env.PORT || 3000;
const publicDirectoryPath = path.join(__dirname, '../public');

app.use(express.static(publicDirectoryPath));

//server(emit) -> client (receive) --acknowledgement (optional) -> Server
//client(emit) -> server (receive) --acknowledgement (optional) -> client
io.on('connection', (socket) => {
    console.log("New WebSocket Connection")

    socket.emit('message', 'Hello!');
    socket.broadcast.emit('message', 'New User Joined')

    //Receive sendMessage on Server and when fired send message to all connected clients.
    socket.on('sendMessage', (message, ack) => {
        io.emit('message', message);
        ack();
    });

    //Receive sendLocation on Server
    socket.on('sendLocation', function(location, ack) {
        io.emit('locationMessage', `https://google.com/maps?q=${location.latitude},${location.longitude}`);
        ack('Your Location was Shared');
    });

    socket.on('disconnect', () => {
        io.emit('message', 'User Has Left.')
    });
});

server.listen(port, () => {
    console.log('Server is on port ' + port);
});