const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const chatSchema = new mongoose.Schema({
  partner_id: [
    { type: Schema.Types.ObjectId, ref: 'user' }
  ],
  conversation: [{
    message: String,
    unread: String,
    created: Date,
    sender: { type: Schema.Types.ObjectId, ref: 'user' },
  }],
  unread: String,
  created: Date,
  is_blocked: String,
});

const chat = mongoose.model("chat", chatSchema);

module.exports = chat;
