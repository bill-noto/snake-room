var express = require('express');
var app = express();
app.use(express.static('public'));

var http = require('http');
var server = http.createServer(app);
var io = require('socket.io')(server);

var randomHex = require('random-hex');

var users = [];
var pointPos = pointPosRandomizer();

    // id: 'sadad',
    // username: 'asdasd',
    // score: 231,
    // position: [
    //     {x, y},
    //     {x, y},
    //     {x, y}
    // ]

io.on('connection', function(socket) {
    console.log('New client connected')
    socket.emit('userId', socket.id);
    socket.emit('updatedPointPosition', pointPos);

    socket.on('newUser', function(data) {
        users.push({
            id: socket.id,
            username: data,
            score: 0,
            color: randomHex.generate()
        })
        io.emit('usersList', users);
    })

    socket.on('updatedScore', function(score) {
        for (let i = 0; i < users.length; i++) {
            if (socket.id === users[i].id) {
                users[i].score = score;
                break;
            }
            io.emit('usersList', users);
        }
    })

    socket.on('snakePosition', function (positions) {
        for (let i = 0; i < users.length; i++) {
            if (socket.id === users[i].id) {
                users[i].positions = positions;
                break;
            }
            io.emit('usersList', users);
        }
    })

    socket.on('pointEaten', function() {
        pointPos = pointPosRandomizer();
        console.log(pointPos);
        io.emit('updatedPointPosition', pointPos);
    })

    socket.on('disconnect', function() {
        for(var i = 0; i < users.length; i++){
            if(users[i].id == socket.id) {
                console.log('User with id ' + socket.id + ' has disconnected')
                users.splice(i, 1);
                io.emit('usersList', users);
            }
        }
    })
})
server.listen(3000, () => {
    console.log('Listening on localhost:3000');
})

var gameIsOn = setInterval(function() {
    io.emit('usersList', users)
}, 100)

function pointPosRandomizer() {
    let pointPositionX = Math.round(Math.random()*49) * 10 + "px";
    let pointPositionY = Math.round(Math.random()*49) * 10 + "px";
    return { left: pointPositionX, top: pointPositionY };
}