const socket = io();


socket.on('message', (message) => {
    console.log(message);
});

document.querySelector('#message-form').addEventListener('submit', (e) => {
    //Prevents full Web Browser Refresh
    e.preventDefault();

    const message = e.target.elements.message.value; //document.querySelector('input').value;

    socket.emit('sendMessage', message);
});