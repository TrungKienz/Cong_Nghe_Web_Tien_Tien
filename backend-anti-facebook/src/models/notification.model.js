const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const notificationSchema = new mongoose.Schema({
    type: String,
    object_id: String,
    title: String,
    notification_id: { type: Schema.Types.ObjectId, ref: 'post' },
    created: Date,
    avatar: String,
    group: String,
    read: String,
    last_update: String,
    userId: { type: Schema.Types.ObjectId, ref: 'user' }, // id người tạo notification
});

const notification = mongoose.model('notification', notificationSchema);

module.exports = notification;
