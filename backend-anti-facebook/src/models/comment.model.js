const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const commentSchema = new mongoose.Schema({
  poster: { type: Schema.Types.ObjectId, ref: 'user' },// id
  author: { type: Schema.Types.ObjectId, ref: 'user' },
  comment: String,
  created: Date,
});

const comment = mongoose.model("comment", commentSchema);

module.exports = comment;
