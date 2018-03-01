const db = require('./models');

module.exports = function(app, passport, io) {
	
	// io.use((socket, next) => {		
	//   let handshake = socket.handshake;
	//   console.log(handshake);
	//   // find out how to handle data/cookies
	//   // sessions, add io.use in passport.js?
	//   console.log(socket.id);
	// });


	passport.serializeUser( (id, done) => {
		console.log('in serialize');
		done(null, id);
	});

	passport.deserializeUser( (id,done) => {
		done(null, id);
	});

	function authenticationMiddleware () {  
		return (req, res, next) => {
			console.log(`req.session.passport.user: ${JSON.stringify(req.session.passport)}`);

		    if (req.isAuthenticated()) return next();
		    res.redirect('/')
		}
	}

	app.get('/chat', function(req, res) {
		res.sendFile(__dirname + '/public/chat.html');
	});

	app.get('/home', authenticationMiddleware(),function(req, res) {
		console.log('in routes ========================')
		console.log(req.user);
		console.log(req.isAuthenticated());
		res.sendFile(__dirname + '/public/home.html');
	});

	app.get('/home/:user', function(req, res) {
		res.sendFile(__dirname + '/public/home.html');
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

	app.get('/api/users/:user', function(req, res) {
		var username = req.params.user
		db.User.find({username: {$regex : "^" + username} }).then(function(user) {
			console.log(user);
			res.json(user);
		}).catch(function(err) {
			res.json(err);
		});
	});

	// app.post('/add/:id', function(req, res) {
	// 	var id = req.params.id

	// 	db.User.findById(id, function(err, user) {
	// 		if(err) res.json(err);
			
	// 	})

	// });

	app.post('/signup', passport.authenticate('signup', {
		successRedirect: '/home',
		failureRedirect: '/',
	}));

	app.post('/login', passport.authenticate('login', {
		successRedirect: '/home',
		failureRedirect: '/'
	}));
}
