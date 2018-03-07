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

	app.get('/home', authenticationMiddleware(), function(req, res) {
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

	//gets all users
	app.get('/api/users', function(req, res) {
		db.User.find({}).then(function(user) {
			res.json(user);
		}).catch(function(err) {
			res.json(err);
		});
	});

	//gets one specific user --> to update client
	app.get('/update', function(req, res) {
		if(req.isAuthenticated() && req.user) {
			// var user = req.user;
			var user = {
				friends: req.user.friends,
				friendRequests: req.user.friendRequests,
				mail: req.user.mailbox,
				username: req.user.username,
				id: req.user._id
			}
			res.json(user);
		}
	});

	// route to search for friends
	app.get('/api/users/:user', function(req, res) {
		var username = req.params.user
		db.User.find({username: {$regex : "^" + username} }).then(function(user) {
			console.log(user);
			res.json(user);
		}).catch(function(err) {
			res.json(err);
		});
	});

	// updates user friend list to add friend to friends list
	app.post('/accept/:name', function(req, res) {
		var name = req.params.name
		console.log('##### in accept route #####');
		console.log(name);

		if(req.isAuthenticated() && req.user) {
			var current_user = req.user;
			var sender = null;
			console.log(req.user);
			console.log("\n\n________________________________________");
			// which is better findById or standard search?

			// finding sender of friend request in db
			db.User.find({username: name}).then(function(user) {

				sender = user[0];
				sender.friends.push(current_user.username);
				console.log(user);
				sender.save(function(err) {
					if(err) console.log(err);
				});

				current_user.friends.push(sender.username);
				current_user.save(function(err) {
					if(err) console.log(err);
				});
			}).catch( function(err) {
				res.json(err);
			});

			// db.User.findById(id, function(err, user) {
			// 	if(err) res.json(err);
				
			// 	console.log(user);
			// 	console.log('sssss');
			// 	// user.friends.push(current_user);
			// 	// user.save(function(err, newUser) {
			// 	// 	if(err) console.log(err);

			// 	// 	console.log(newUser);
			// 	// });
			// 	// current_user.friends.push(user);
			// 	// current_user.save(function(err, newUser) {
			// 	// 	if(err) console.log(err);
			// 	// 	console.log(newUser);
			// 	// });
			// });	
		}

	});

	// creates a friend request obj and pushed into added user
	app.post('/add/:id', function(req, res) {
		var id = req.params.id
		console.log('$$$$$$$$$$$$$$$$$$$$ in add route $$$$$$$$$$$$')

		if(req.isAuthenticated() && req.user) {
			var sender = req.user;
			var friendReq = new db.Message({
				type: 'friend',
				text: 'Lets be friends!',
				sender: req.user.username
			});

			db.User.findById(id, function(err, user) {
				if(err) res.json(err);
				
				console.log(user);
				user.friendRequests.push(friendReq);
				user.save(function(err, newUser) {
					if(err) console.log(err);

					console.log(newUser);
				});
			})
		}

	});

	app.post('/signup', passport.authenticate('signup', {
		successRedirect: '/home',
		failureRedirect: '/',
	}));

	app.post('/login', passport.authenticate('login', {
		successRedirect: '/home',
		failureRedirect: '/'
	}));

	app.get('/logout', function(req, res) {
		req.logout();
		req.session = null;
		res.redirect('/');
	});
}
