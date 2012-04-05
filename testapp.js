var app = require('express').createServer()
var io = require('socket.io').listen(app);

app.listen(8080);

// routing
app.get('/', function (req, res) {
  res.sendfile(__dirname + '/newIndex.html');
});

app.get('/room1.html', function(req, res){
  res.sendfile(__dirname + '/room1.html');
});

app.get('/room2.html', function(req, res){
  res.sendfile(__dirname + '/room2.html');
});

app.get('/room3.html', function(req, res){
  res.sendfile(__dirname + '/room3.html');
});

// usernames which are currently connected to the chat
var usernames = {};

// rooms which are currently available in chat
var rooms = ['room1','room2','room3'];

io.sockets.on('connection', function (socket) {
	
	socket.on('land', function(){
		socket.emit('updaterooms', rooms);
	});
	
	// when client emits 'joinRoom', this sends the user to the given room
	socket.on('joinRoom', function(newroom, username){
		// store the username in the socket session for this client
		socket.username = username;
		
		// store the room name in the socket session for this client
		socket.room = newroom;
		
		// add the client's username to the global list
		usernames[username] = username;
		
		// send client to room
		socket.join(newroom);
		
		// echo to client they've connected
		socket.emit('onJoin', 'SERVER', 'you have connected to roomTEST');
		
		socket.broadcast.to(newroom).emit('updatechat', 'SERVER', username + ' has connected to this room');
		
	});
	
		// when the client emits 'sendchat', this listens and executes
	socket.on('sendchat', function (data) {
		// we tell the client to execute 'updatechat' with 2 parameters
		io.sockets.in(socket.room).emit('updatechat', socket.username, sanitize(data));
	});
	
		// when the user disconnects.. perform this
	socket.on('disconnect', function(){
		// remove the username from global usernames list
		delete usernames[socket.username];
		// update list of users in chat, client-side
		io.sockets.emit('updateusers', usernames);
		// echo globally that this client has left
		socket.broadcast.emit('updatechat', 'SERVER', socket.username + ' has disconnected');
		socket.leave(socket.room);
	});
});

function sanitize(inputHtml) {
    inputHtml = inputHtml.toString();
    return inputHtml.replace(/&/g, "&amp;")
                    .replace(/</g, "&lt;")
                    .replace(/>/g, "&gt;");
}
