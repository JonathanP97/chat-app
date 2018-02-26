const express = require('express');
const app = express();
app.use(express.static("public"));
const passport = require('passport');
require('./config/passport.js')(passport);
const path = require('path');
const mongoose = require('mongoose');
const URI = process.env.MONGOLAB_URI || 'mongodb://localhost/chat-app';
const PORT = process.env.PORT || 3500;
const io = require('socket.io').listen(app.listen(PORT));
const CURRENT_USERS = [];
var all_users = 0;
var myid = null;


mongoose.Promise = Promise; 
mongoose.connect(URI, (err, res) => {
	if(err) console.log(err);
	else {
		console.log('Connected to mongo');

	}

})

require('./routes.js')(app, io);

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