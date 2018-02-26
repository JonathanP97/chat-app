var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UserSchema = new Schema({
  username: { 
  	type: String,
  	trim: true,
  	required: "user needs username"
  },
  name: {
    type: String
  },
  password: {
    type: String,
    required: "password please"
  },
  dateCreated: {
  	type: Date,
  	default: Date.now
  },
  mailbox: [{
    type: Schema.Types.ObjectId,
    ref: "Message"
  }],
  friends: [{
  	type: Schema.Types.ObjectId,
  	ref: "User"
  }]
});


var User = mongoose.model("User", UserSchema);
module.exports = User;