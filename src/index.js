const path = require('path');
const http = require('http');
const socketio = require('socket.io');
const express = require('express');
const { generateMessage } = require('./utils/messages');
const { generateLocationMessage } = require('./utils/messages');


const app = express();
const server = http.createServer(app);
const io = socketio(server);

const port = process.env.PORT || 3000;
const publicDirectoryPath = path.join(__dirname, '../public');

app.use(express.static(publicDirectoryPath));

//server(emit) -> client (receive) --acknowledgement (optional) -> Server
//client(emit) -> server (receive) --acknowledgement (optional) -> client
io.on('connection', (socket) => {
    console.log("New WebSocket Connection");
    
    socket.on('join', ({ username, room }) => {
        socket.join(room);

        //Send Objects back when we emit/send message, using gernerateMessage() in messages.js
        socket.emit('message', generateMessage('Hello!'));
        socket.broadcast.to(room).emit('message', generateMessage(`${username} has joined.`));
    });

    //Receive sendMessage on Server and when fired send message to all connected clients.
    socket.on('sendMessage', (message, ack) => {
        io.emit('message', generateMessage(message));
        ack();
    });

    //Receive sendLocation on Server
    socket.on('sendLocation', function(location, ack) {
        io.emit('locationMessage', generateLocationMessage(`https://google.com/maps?q=${location.latitude},${location.longitude}`));
        ack('Your Location was Shared');
    });

    socket.on('disconnect', () => {
        io.emit('message', generateMessage('User Has Left.'));
    });
});

server.listen(port, () => {
    console.log('Server is on port ' + port);
});

//socket.emit - sends an emit to a specific client
//io.emit - sends an event to every connected client
//socket.broadcast.emit - sends an event to every connected client except to the socket client
//io.to().emit - sends an event to everyone in a room
//socket.broadcast.to().emit - sends an event to every connected client to a room except to the socket client
