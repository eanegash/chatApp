const users = []


// Add User
const addUser = ({id, username, room }) => {
    //Clean Data - Convert strings to lower case, validate strings, and trim spaces.
    username = username.trim().toLowerCase();
    room = room.trim().toLowerCase();


    //Validate Data
    if (!username || !room){
        return {
            error: 'Username and room are required!'
        }
    }

    //Check for existing user and room.
    const existingUser = users.find((user) => {
        return user.room === room && user.username === username
    });

    //validate username
    if(existingUser){
        return {
            error: 'Username is in use!'
        }
    }

    //Store User
    const user = {id, username, room};
    users.push(user);
    return { user }

}


//Remove User
const removeUser = (id) => {
    //Returns -1 if no match or returns a 0 or Number Greater if a match found.
    const index = users.findIndex((user) => {
        return user.id === id;
    });

    if (index !== -1){
        //Remove only 1 item in object and return that user object [0]
        return users.splice(index, 1)[0];
    }
}


//Get User
const getUser = (id) => {
    return users.find((user) => user.id === id);
}


//Get User(s) Room
const getUsersInRoom = (room) => {
    //Dont need to manipulate variable room. Value comes from Server will be formatted. 
    //Dont Need To worry about User Input. Left here as a reminder.
    room = room.trim().toLowerCase();
    return  users.filter((user) => user.room === room)
}


module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}












//TESTING MATERIAL
/*
addUser({
    id: 22,
    username: 'Andrew',
    room: 'South Philly'
});

addUser({
    id: 10,
    username: 'Mike',
    room: 'South Phully'
});

addUser({
    id: 34,
    username: 'John',
    room: 'Fairmont'
});
*/

//const removedUser = removeUser(22);

//const userList = getUsersInRoom('south philly')
//console.log9userList)

//CMD - node src/utils/users.js //TO TEST IMPLEMETATION