const path = require('path');
const http = require('http');
const socketio = require('socket.io');
const express = require('express');
const { generateMessage, generateLocationMessage } = require('./utils/messages');
const {addUser, removeUser, getUser, getUsersInRoom} = require('./utils/users');


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
    
    socket.on('join', ({ username, room }, ack) => {
        //Destructure Object. End up w/ an error or user object (socket.id, username, room)
        const {error, user} = addUser({id: socket.id, username, room});

        //Error returned - send back an Acknowledgment (callback) letting client now of Error.
        if (error){
            return ack(error)
        }
        
        socket.join(user.room);

        //Send Objects back when we emit/send message, using gernerateMessage() in messages.js
        socket.emit('message', generateMessage('Admin', 'Welcome!'));
        socket.broadcast.to(user.room).emit('message', generateMessage(user.username, `${user.username} has joined.`));
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        });
    });



    //Receive sendMessage on Server and when fired send message to all connected clients.
    socket.on('sendMessage', (message, ack) => {
        const user = getUser(socket.id);
        
        io.to(user.room).emit('message', generateMessage(user.username, message));
        ack(`${user.username}`);

    });


    //Receive sendLocation on Server
    socket.on('sendLocation', function(location, ack) {

        const user = getUser(socket.id);
        
        io.to(user.room).emit('locationMessage', generateLocationMessage(user.username, `https://google.com/maps?q=${location.latitude},${location.longitude}`));
        ack(`${user.username} Has Shared Their Location!`); 
    
    });


    //Disconnet Once User Left Room
    socket.on('disconnect', () => {
        //With socket.id we have access to user information: username, room...
        const user = removeUser(socket.id);
        //User exists then remove them from the Room
        if (user) {
            io.to(user.room).emit('message', generateMessage(user.username, `${user.username} HAS LEFT!`));
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            });
        }
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
