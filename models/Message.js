var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var MessageSchema = new Schema({
  subject: {
    type: String
  },
  text: { 
  	type: String,
  	required: "missing msg text"
  },
  dateSent: {
  	type: Date,
  	default: Date.now
  },
  sender: {
    type: String
  },
  reciever: {
    type: String
  }
});

var Message = mongoose.model("Message", MessageSchema);
module.exports = Message;