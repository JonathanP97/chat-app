var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

var User = require('../models/User');
module.exports = function(passport) {

	passport.serializeUser( (user, done) => {
		done(null, user.id);
	});

	passport.deserializeUser( (id,done) => {
		User.findById(id, (err, user) => {
			done(err, user);
		})
	});

	passport.use(new LocalStrategy({
		usernameField: 'username',
		passwordField: 'password',
		passReqToCallback: true
	},
	(req, username, password, done) => {
		// proccess.nextTick(function() {

		User.findOne({ 'username': username }, (err, user) => {
			if(err) return done(err);

			if(user) {
				return done(null, false, console.log('Username taken'));
			} else {
				// console.log(req);
				var newUser = new User();
				newUser.username = username;
				newUser.password = newUser.generateHash(password);

				// newUser.create({username: username, password: password}, (err,data) =>{
				// 	if(err) console.log(err);
				// }); 

				newUser.save(err => {
					if(err) throw err;

					return done(null, newUser);
				});
			}
		});

		// });
	}
	));	
}