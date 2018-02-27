const db = require('./models');

module.exports = function(app, passport) {
	app.get('/chat', function(req, res) {
		res.sendFile(__dirname + '/public/chat.html');
	});

	app.get('/', function(req, res) {
		res.sendFile(__dirname + '/public/login.html');
	});

	app.get('/api/users', function(req, res) {
		db.User.find({}).then(function(user) {
			res.json(user);
		}).catch(function(err) {
			res.json(err);
		});
	});

	app.post('/signup', passport.authenticate('signup', {
		successRedirect: '/chat',
		failureRedirect: '/login',
		failureFlash: false,
		session: false
	}));


	app.post('/login', passport.authenticate('login', {
		successRedirect: '/chat',
		failureRedirect: '/login',
		session: false
	}));
}
