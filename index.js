const express = require('express');
const app = express();
const morgan = require('morgan');
const passport = require('passport');
const bodyParser = require('body-parser');
require('./config/passport.js')(passport);
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static('public'));
app.use(passport.initialize());
const path = require('path');
const mongoose = require('mongoose');
const URI = process.env.MONGOLAB_URI || 'mongodb://localhost/chat-app';
const CURRENT_USERS = [];
var all_users = 0;
const PORT = process.env.PORT || 3500;
const io = require('socket.io').listen(app.listen(PORT, () => {
	console.log('On port: ' + PORT);
}));


mongoose.Promise = Promise; 
mongoose.connect(URI, (err, res) => {
	if(err) console.log(err);
	else {
		console.log('Connected to mongo');
	}

})

require('./routes.js')(app, passport);

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