const express = require('express');
const mongoose = require('mongoose');
const db = require('./models');
const URI = process.env.MONGOLAB_URI || 'mongodb://localhost/chat-app';
const socketIO = require('socket.io');
const PORT = process.env.PORT || 3500;
const CURRENT_USERS = [];
var all_users = 0;

mongoose.Promise = Promise; 
mongoose.connect(URI, (err, res) => {
	if(err) console.log(err);
	else {
		console.log('Connected to mongo');

		db.User.create({
			username: 'JonJJon',
			name: {
				first: "Jon",
				last: "Plata"
			},
			password: 'password'
		}).then(()=> {
			console.log('new user created');
		}).catch(err => res.json(err));
	}

})

const server = express()
  .use((req, res) => res.sendFile(__dirname + '/index.html'))
  .listen(PORT, () => console.log('Listening on port: ' + PORT));

const io = socketIO(server);


io.on('connection', (socket) => {
	io.emit('landed-on', all_users);
	
	socket.on('exit', (user) => {
		console.log(user);
	});

	socket.on('disconnect', () => {
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