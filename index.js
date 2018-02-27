const express = require('express');
const app = express();
const morgan = require('morgan');
const passport = require('passport');
const bodyParser = require('body-parser');
const path = require('path');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const passportSocketIo = require('passport.socketio');
const session = require('express-session');
const redisUrl = require('redis-url').connect(process.env.REDIS_URL);
const RedisStore = require('connect-redis')(session);
const sessionStore = new RedisStore({ client: redisUrl });
require('./config/passport.js')(passport);
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static('public'));

app.use(session({
	store: sessionStore,
	resave: false,
	saveUninitialized: false,
	key: 'express.sid',
	secret: 'my secret'
}));
app.use(passport.initialize());
app.use(passport.session());

// const PORT = process.env.PORT || 3500;
const URI = process.env.MONGOLAB_URI || 'mongodb://localhost/chat-app';
const CURRENT_USERS = [];
var all_users = 0;

/// testing
const socketio = require('socket.io');
const http = require('http');
const server = http.Server(app);
var io = socketio(server);
server.listen(3500);
io.use(passportSocketIo.authorize({
  key: 'express.sid',
  secret: 'my secret',
  store: sessionStore,
  passport: passport,
  cookieParser: cookieParser,
  success: onAuthorizeSuccess,
  fail: onAuthorizeFail
}));

function onAuthorizeSuccess(data, accept) {
	console.log('successful connection');

	accept(null, true);
}

function onAuthorizeFail(data, message, error, accept){
  if(error)
    throw new Error(message);
  console.log('failed connection to socket.io:', message);
 
  // We use this callback to log all of our failed connections. 
  accept(null, false);
}


// const io = require('socket.io').listen(app.listen(PORT, () => {
// 	console.log('On port: ' + PORT);
// }));


mongoose.Promise = Promise; 
mongoose.connect(URI, (err, res) => {
	if(err) console.log(err);
	else {
		console.log('Connected to mongo');
	}

})

require('./routes.js')(app, passport);


// io.on('connection', function(socket) {
//   io.emit('landed-on', all_users);

//   // example 'event1', with an object. Could be triggered by socket.io from the front end
//   socket.on('event1', function(eventData) {
//   	// user data from the socket.io passport middleware
//     if (socket.request.user && socket.request.user.logged_in) {
//       console.log(socket.request.user);
//     }
//   });
// });


var User = require('./models/User');

// Below express-session middleware
// Pass just the user id to the passport middleware
passport.serializeUser(function(user, done) {
  done(null, user.id);
});

// Reading your user base ont he user.id
passport.deserializeUser(function(id, done) {
  User.get(id).run().then(function(user) {
    done(null, user.public());
  });
});


io.on('connection', (socket) => {
	io.emit('landed-on', all_users);
	
	socket.on('exit', (user) => {
		console.log(user);
	});

	socket.on('event', (data) => {
		console.log(socket.request)
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