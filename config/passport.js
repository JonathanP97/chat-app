var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

var User = require('../models/User');

module.exports = function(passport, io) {
	// io.use((socket, next) => {
 //  	  let handshake = socket.handshake;
 //  	  console.log(handshake);
 //  	  // find out how to handle data/cookies
 //  	  // sessions, add io.use in passport.js?
	//   console.log(socket.id);
	// });

	// passport.serializeUser( (id, done) => {
	// 	console.log('in serialize');
	// 	done(null, id);
	// });

	// passport.deserializeUser( (id,done) => {
	// 	done(null, id);
	// });

	passport.use('signup', new LocalStrategy ({
		usernameField: 'username',
		passwordField: 'password',
		passReqToCallback: true
	},
	(req, username, password, done) => {

		User.findOne({ 'username': username }, (err, user) => {
			if(err) return done(err);

			if(user) {
				return done(null, false, console.log('Username Taken'));
			} else {
				var newUser = new User();
				newUser.username = username;
				newUser.password = newUser.generateHash(password);

				newUser.save(err => {
					if(err) throw err;

					User.findById(newUser.id, (err, user) => {
						if(err) throw err;

						console.log(user)
					})

					return done(null, newUser);
				});
			}
		});
	}
	));	

	passport.use('login', new LocalStrategy ({
		usernameField: 'username',
		passwordField: 'password',
		passReqToCallback: true
	}, 
	(req, username, password, done) => {
		User.findOne({'username': username}, (err, user) => {
			if(err) return done(err);

			if(!user) return done(null, false, console.log('No user found'));

			if(!user.validPassword(password)) 
				return done(null, false, console.log('Wrong password'));

			const user_id = user._id

			console.log(user_id);			
			req.login(user_id, err => {
				if(err) throw err;
				console.log('========================')
			});

			// User.findById(newUser.id, (err, user) => {
			// 	if(err) throw err;

			// 	console.log(user)
			// })

			return done(null, user);
		});
	}
	));
}