const express = require('express');
const socketIO = require('socket.io');
const PORT = process.env.PORT || 3500;

const server = express()
  .use((req, res) => res.sendFile(__dirname + '/index.html'))
  .listen(PORT, () => console.log('Listening on port: ' + PORT));

const io = socketIO(server);
const CURRENT_USERS = [];
var all_users = 0;

io.on('connection', (socket) => {
	io.emit('landed-on', all_users);
	
	socket.on('exit', (user) => {
		console.log(user);
	})

	socket.on('disconnect', () => {
		console.log(CURRENT_USERS)
		console.log(all_users);
		io.emit('disconnect', all_users);
	});

	socket.on('new-user', (user) => {
		var name = user.name;
		CURRENT_USERS.push(user);
		all_users = CURRENT_USERS.length;

		console.log(CURRENT_USERS);
		console.log(all_users);
		io.emit('new-user', name);
	});

	socket.on('msg', (user) => {
		var name = user.name;
		var message = user.msg;
		console.log(name + ': ' + message);
		socket.broadcast.emit('msg', name + ":  " + message);
	});
});