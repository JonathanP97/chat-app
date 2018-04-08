const db = require('./models');

module.exports = function(app, passport, io) {
	
	// io.use((socket, next) => {		
	//   let handshake = socket.handshake;
	//   console.log(handshake);
	//   // find out how to handle data/cookies
	//   // sessions, add io.use in passport.js?
	//   console.log(socket.id);
	// });

	// passport.serializeUser( (id, done) => {
	// 	console.log('in serialize');
	// 	done(null, id);
	// });

	// passport.deserializeUser( (id,done) => {
	// 	done(null, id);
	// });

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



	/**************/
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
	/***************/



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

	// UPDATES USER (working)
	// gets data on user to update client 
	// friend requests, friends and mail
	app.get('/update', function(req, res) {
		console.log(req.user.username);

		if(req.isAuthenticated() && req.user) {
			//make function
			db.User.find({username: req.user.username}).then(function(user) {
			  var newUser = {
				friends: user[0].friends,
				friendRequests: user[0].friendRequests,
				mail: user[0].mailbox,
				username: user[0].username,
				id: user[0]._id
			  }

			  res.json(newUser);

			}).catch(function(err) {
			  res.json(err);
			});
			//
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
		var name = req.params.name;
		console.log('^^^^^^^^^^Sender^^^^^^^^^^: ',name);

		if(req.isAuthenticated() && req.user) {
			var current_user = req.user;
			var sender = null;
			console.log('##########################');
			console.log(current_user);
			current_user.friends.push(name);
			console.log(current_user);

			
			db.User.find({username: name}, function(err, user) {
				console.log(user[0]);
				if(!user) return res.json(err);
				else {
				    user[0].modified = new Date();
				    user[0].friends.push(current_user.username);				    
				    user[0].save(function(err) {
				      if (err)
				        console.log('error')
				      else
				        console.log('success')
				    	current_user.save(function(err) {
					      if (err)
					        console.log('error')
					      else
					        console.log('success')				    		
				    	})
				    });	
				}
			})


			// finding sender of friend request in db
			// db.User.find({username: name}).then(function(user) {

			// 	console.log(user[0].username);
			// 	// user[0].friends.push(current_user.username);
		
			// 	// user[0].save(function(err) {
			// 	// 	if(err) res.json(err);
			// 	// });

			// 	current_user.save(function(err) {
			// 		if(err) res.json(err);   
			// 	});

			// }).catch( function(err) {
			// 	res.json(err);
			// });

		}

	});

	// Send Friend Requests (working)
	// updates friend request to recievers inbox
	app.post('/request/:name', function(req, res) {
		var reciever_username = req.params.name;

		if(req.isAuthenticated() && req.user) {
			var sender = req.user;
			var friendReq = {
				text: req.body.text || 'Let\'s be friends!',
				sender: sender.username,
				date_sent: Date.now()
			};

			db.User.find({username: reciever_username}, function(err, user) {
				if(err) res.json(err);

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
