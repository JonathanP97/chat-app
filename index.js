var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

io.on('connection', function(socket) {
	console.log('user connected');

	socket.on('disconnect', function() {
		console.log('user disconnected');
	});

	socket.on('new-user', function(name) {
		io.emit('new-user', name);
	});

	socket.on('msg', function(user) {
		var name = user.name;
		var message = user.msg;
		console.log(name + ': ' + message);
		socket.broadcast.emit('msg', name + ":  " + message);
	});
});

app.get('/', function(req, res){
	res.sendFile(__dirname + '/index.html');
});

http.listen(3500, function() {
	console.log('On port 3500');
});