const socket = io();

const $messageForm = document.querySelector('#message-form');
const $messageFormInput = $messageForm.querySelector('input');
const $messageFormButton = $messageForm.querySelector('button');
const $sendLocationButton = document.querySelector('#send-location');
const $messages = document.querySelector('#messages');


//Template(s) - How we render JS variables to the html page.
const messageTemplate = document.querySelector('#message-template').innerHTML;
const locationTemplate = document.querySelector('#location-template').innerHTML;

//Destructuring Object that comes back: Options - CDN Query String used to parse (1st param) and ignore the '?' (2nd param)
const {username, room} = Qs.parse(location.search, { ignoreQueryPrefix: true })

//Listening for Message Event sent from Server (index.js)
socket.on('message', (message) => {
    console.log(message);
    const html = Mustache.render(messageTemplate, { 
        message: message.text,
        //moment.js formatting timestamp
        createdAt: moment(message.createdAt).format('H:mm') //'h:mm a'
    });
    $messages.insertAdjacentHTML('beforeend', html);
});

//Listening for Location Message Event sent from Server (index.js)
socket.on("locationMessage", (mapsUrl) => {
    console.log(mapsUrl);
    const html = Mustache.render(locationTemplate, {
        locationUrl: mapsUrl.url,
        createdAt: moment(mapsUrl.createdAt).format('H:mm')
    });
    $messages.insertAdjacentHTML('beforeend', html);
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

//Omit call from the Client. 
socket.emit('join', { username, room });