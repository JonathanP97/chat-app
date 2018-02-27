var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var MessageSchema = new Schema({
  type: {
    type: String,
    default: "message"
  },
  text: { 
  	type: String
  },
  dateSent: {
  	type: Date,
  	default: Date.now
  },
  reciever: {
    type: String
  }
});

var Message = mongoose.model("Message", MessageSchema);
module.exports = Message;