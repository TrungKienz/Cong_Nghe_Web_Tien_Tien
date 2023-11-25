const mongoose = require('mongoose');
const chatSchema = require('./chat.model');
const Schema = mongoose.Schema;

const conversationSchema = new mongoose.Schema({
    partner_id: [{ type: Schema.Types.ObjectId, ref: 'user' }],
    conversation: [chatSchema],
    unread: String,
    created: Date,
    is_blocked: String,
});

const conversation = mongoose.model('conversation', conversationSchema);

module.exports = conversation;
