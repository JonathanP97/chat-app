const express = require('express');
const socketIO = require('socket.io');
const PORT = process.env.PORT || 3500;

const server = express()
  .use((req, res) => res.sendFile(__dirname + '/index.html'))
  .listen(PORT, () => console.log('Listening on port: ' + PORT));

const io = socketIO(server)

io.on('connection', (socket) => {
	console.log('user connected');

	socket.on('disconnect', () => {
		console.log('user disconnected');
	});

	socket.on('new-user', (name) => {
		io.emit('new-user', name);
	});

	socket.on('msg', (user) => {
		var name = user.name;
		var message = user.msg;
		console.log(name + ': ' + message);
		socket.broadcast.emit('msg', name + ":  " + message);
	});
});