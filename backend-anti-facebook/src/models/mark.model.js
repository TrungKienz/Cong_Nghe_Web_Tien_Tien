const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const markSchema = new mongoose.Schema({
    poster: { type: Schema.Types.ObjectId, ref: 'user' }, // id
    author: { type: Schema.Types.ObjectId, ref: 'user' },
    mark_id: String,
    type: Number,
    content: String,
    created: Date,
});

const mark = mongoose.model('mark', markSchema);

module.exports = mark;
