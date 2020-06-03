const socket = io();

const $messageForm = document.querySelector('#message-form');
const $messageFormInput = $messageForm.querySelector('input');
const $messageFormButton = $messageForm.querySelector('button');
const $sendLocationButton = document.querySelector('#send-location');
const $messages = document.querySelector('#messages');


//Template(s) - How we render JS variables to the html page.
const messageTemplate = document.querySelector('#message-template').innerHTML;
const locationTemplate = document.querySelector('#location-template').innerHTML;
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML;

//Destructuring Object that comes back: Options - CDN Query String used to parse (1st param) and ignore the '?' (2nd param)
const {username, room} = Qs.parse(location.search, { ignoreQueryPrefix: true })


//Provide User with ability to scroll to the bottom.
//If at bottom scroll down w/ every new message. 
//If user isn't at bottom don't scroll to bottom if new message sent.
const autoscroll = () => {
    //Last Message Element
    const $lastMessage = $messages.lastElementChild;

    //Height of the Last Message. -Grab last message sent -Grab its margin value -Add margin value to its height
    const lastMessageStyles = getComputedStyle($lastMessage);
    const lastMessageMargin = parseInt(lastMessageStyles.marginBottom);
    const lastMessageHeight = $lastMessage.offsetHeight;

    //Vsible Height
    const visibleHeight = $messages.offsetHeight;
    
    //Meassages Contaier Height
    const contHeight = $messages.scrollHeight;

    //Position of Scroll - How far has user scrolled?
    const scrollOffset = $messages.scrollTop + visibleHeight;

    //Are we scrolled to the bottom before last message came in?
    if (containerHeight - lastMessageHeight <= scrollOffset) {
        //Push user to the bottom
        $messages.scrollTop = $messages.scrollHeight;
    }

}

//Listening for Message Event sent from Server (index.js)
socket.on('message', (message) => {
    console.log(message);
    const html = Mustache.render(messageTemplate, {
        username: message.username, 
        message: message.text,
        //moment.js formatting timestamp
        createdAt: moment(message.createdAt).format('h:mm a') //'h:mm a'
    });
    $messages.insertAdjacentHTML('beforeend', html);
    autoscroll();
});

//Listening for Location Message Event sent from Server (index.js)
socket.on("locationMessage", (mapsUrl) => {
    console.log(mapsUrl);
    const html = Mustache.render(locationTemplate, {
        username: mapsUrl.username,
        locationUrl: mapsUrl.url,
        createdAt: moment(mapsUrl.createdAt).format('h:mm a')
    });
    $messages.insertAdjacentHTML('beforeend', html);
});

//
socket.on('roomData', ({ room, users }) => {
    const html = Mustache.render(sidebarTemplate, {
        room: room,
        users: users
    });
    document.querySelector('#sidebar').innerHTML = html
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
socket.emit('join', { username, room }, (error) => {
    //Acknowldgment sends back an error from Server. Open a Modal Alert User and then send User back to root directory.
    if(error){
        alert(error);
        location.href = '/';
    }
});