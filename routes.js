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
		if(req.isAuthenticated() && req.user) {
		  res.sendFile(__dirname + '/public/home.html');
		} else {
		  res.sendFile(__dirname + '/public/login.html');
		}
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
		//TODO INGORE CASE
		db.User.find({username: {$regex : "^" + username} }).then(function(user) {
			console.log(user);
			res.json(user);
		}).catch(function(err) {
			res.json(err);
		});
	});

	// ACCEPT FRIEND REQUESTS (not working)
	// updates user friend list to add friend to friends list
	// id or username
	app.post('/accept/:name', function(req, res) {
		var name = req.params.name
		console.log('##### in accept route #####');
		console.log(name);

		if(req.isAuthenticated() && req.user) {
			var current_user = req.user;
			var sender = null;
			console.log(req.user);
			console.log("\n\n___ ___ ___ ___ ___ ___ ___ ___ ___ ___ ___ ___ ___\n\n");

			// finding sender of friend request in db
			db.User.find({username: name}).then(function(user) {

				sender = user[0];
				sender.friends.push(current_user.username);
				console.log(user);
				sender.save(function(err) {
					if(err) res.json(err);
				});

				current_user.friends.push(sender.username);
				current_user.save(function(err) {
					if(err) res.json(err);   
				});W
			}).catch( function(err) {
				res.json(err);
			});

		}

	});

	// ADD FRIENDS (working 3/10/18)
	// updates friend request to recievers inbox
	app.post('/request/:name', function(req, res) {
		var reciever_username = req.params.name;
		console.log('Reciever:', reciever_username);
		console.log('Request Body:', req.body);

		if(req.isAuthenticated() && req.user) {
			var sender = req.user;
			console.log('sender:', sender);
			var friendReq = {
				text: req.body.text || 'Let\'s be friends!',
				sender: sender.username
			};

			db.User.find({username: reciever_username}, function(err, user) {
				if(err) res.json(err);
				console.log(user);
				user[0].friendRequests.push(friendReq);
				user[0].save(function(err, newUser) {
					if(err) console.log(err);
					console.log(newUser);
				});
			});
		}
	});

	app.post('/ignoreReq/:name', function(req,res) {
		var username = req.params.name;

		if(req.isAuthenticated() && req.user) {
			var current = req.user;

			console.log('\nCurrent User:', current.username);
			console.log('Ignore:', username);
			// var friendReq = {
			// 	text: req.body.text || 'Let\'s be friends!',
			// 	sender: sender.username
			// };

			db.User.find({username: current.username}, function(err, user) {
				if(err) res.json(err);

				// user[0].friendRequests.map( req => {
				// 	console.log(req.sender);

				// });
				console.log('<<<<<<<<<<<<<<<<<<<<<<<<<<<');
				var newRequests = user[0].friendRequests.filter(req => {

					console.log(req);
					console.log('..');
					
					if(req.sender !== username) return req;
				});
				console.log(user[0].friendRequests);
				
				console.log(newRequests);


				user[0].friendRequests = newRequests;
				console.log(user[0]);
				user[0].save(function(err, newUser) {
					if(err) console.log(err);
					console.log("New Guy", newUser);
				});
			});
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
