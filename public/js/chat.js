const socket = io();

const $messageForm = document.querySelector('#message-form');
const $messageFormInput = $messageForm.querySelector('input');
const $messageFormButton = $messageForm.querySelector('button');
const $sendLocationButton = document.querySelector('#send-location');
const $messages = document.querySelector('#messages');


//Template(s)
const messageTemplate = document.querySelector('#message-template').innerHTML;
const locationTemplate = document.querySelector('#location-template').innerHTML;

socket.on('message', (message) => {
    console.log(message);
    const html = Mustache.render(messageTemplate, { 
        message: message
    });
    $messages.insertAdjacentHTML('beforeend', html);
});

socket.on("locationMessage", (mapsUrl) => {
    console.log(mapsUrl);
    const html = Mustache.render(locationTemplate, {
        url: mapsUrl
    })
});

$messageForm.addEventListener('submit', (e) => {
    //Prevents full Web Browser Refresh
    e.preventDefault();

    $messageFormButton.setAttribute('disabled', 'disabled')

    const message = e.target.elements.message.value; //document.querySelector('input').value;
    
    socket.emit('sendMessage', message, function(ack){
        $messageFormButton.removeAttribute('disabled', 'disabled');
        $messageFormInput.value = '';
        $messageFormInput.focus();
    });
});


$sendLocationButton.addEventListener('click', () => {
    if (!navigator.geolocation) {
        return alert('Geolocation is not supported by your browser.');
    } else {
        $sendLocationButton.setAttribute('disabled', 'disabled');
        navigator.geolocation.getCurrentPosition((position) => {
            socket.emit('sendLocation', {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude
            }, function(ack) {
                $sendLocationButton.removeAttribute('disabled', 'disabled');
                console.log(ack);
            });
        });
    }
   
});