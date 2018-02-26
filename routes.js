const db = require('./models');

module.exports = function(app,io) {
	app.get('/', function(req, res) {
		res.sendFile(__dirname + '../public/index.html');
	});

	app.get('/login', function(req, res) {
		res.sendFile(__dirname + '../public/login.html');
	});

	app.get('/api/users', function(req, res) {
		db.User.find({}).then(function(user) {
			res.json(user);
		}).catch(function(err) {
			res.json(err);
		});
	});
}