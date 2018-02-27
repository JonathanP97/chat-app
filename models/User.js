var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt-nodejs');

var UserSchema = new Schema({
  username: { 
  	type: String,
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

UserSchema.methods.generateHash = function(pass) {
  return bcrypt.hashSync(pass, bcrypt.genSaltSync(8), null);
}

UserSchema.methods.validPassword = function(pass) {
  return bcrypt.compareSync(pass, this.password);
}

var User = mongoose.model("User", UserSchema);
module.exports = User;