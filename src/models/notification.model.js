const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const notificationSchema = new mongoose.Schema({
  poster: { type: Schema.Types.ObjectId, ref: 'user' },// id
  author: { type: Schema.Types.ObjectId, ref: 'user' },
  notification: String,
  created: Date,
  postData: { type: Schema.Types.ObjectId, ref: 'post' },
  userData: { type: Schema.Types.ObjectId, ref: 'user' },
  type: String,
  object_id: String,
  title: String,
  notification_id: String,
  created: Date,
  avatar: String,
  group: String,
  read: String,
  badge: String,
  last_update: String,
  
});

const notification = mongoose.model("notification", notificationSchema);

module.exports = notification;
