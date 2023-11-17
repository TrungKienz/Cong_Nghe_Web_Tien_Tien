const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const chatSchema = new mongoose.Schema({
    message: String,
    unread: String,
    created: Date,
    sender: { type: Schema.Types.ObjectId, ref: 'user' },
});

module.exports = chatSchema;
