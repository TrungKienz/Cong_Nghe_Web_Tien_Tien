// Cấu hình models tương ứng
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const userSchema = new mongoose.Schema({
    phonenumber: String,
    verifyCode: Number,
    email: String,
    username: String,
    password: String,
    avatar: String,
    token: String,
    nghenghiep: String,
    songtai: String,
    dentu: String,
    hoctai: String,
    sothich: String,
    birthday: String,
    is_blocked: String,
    description: String,
    city: String,
    country: String,
    cover_image: String,
    link: String,
    coins: Number,
    devtype: String,
    devtoken: String,
    address: String,
    created: Date,
    updateCodeDate: Date,
    requestedFriends: [
        {
            author: {
                type: Schema.Types.ObjectId,
                ref: 'user',
            },
            created: Date,
        },
    ],

    sendRequestedFriends: [
        {
            receiver: {
                type: Schema.Types.ObjectId,
                ref: 'request',
            },
            created: Date,
        },
    ],
    postIds: [
        {
            type: Schema.Types.ObjectId,
            ref: 'post',
        },
    ],
    blockedIds: [
        {
            type: Schema.Types.ObjectId,
            ref: 'user',
        },
    ],
    mark_list: [
        {
            type: Schema.Types.ObjectId,
            ref: 'mark',
        },
    ],
    savedSearch: [
        {
            keyword: String,
            created: Date,
        },
    ],
    active: Number,
    friends: [
        {
            author: {
                type: Schema.Types.ObjectId,
                ref: 'user',
            },
            created: Date,
        },
    ],
    settings: {
        like_comment: { type: String, default: '1' },
        from_friends: { type: String, default: '1' },
        requested_friend: { type: String, default: '1' },
        suggested_friend: { type: String, default: '1' },
        birthday: { type: String, default: '1' },
        video: { type: String, default: '1' },
        report: { type: String, default: '1' },
        sound_on: { type: String, default: '1' },
        notification_on: { type: String, default: '1' },
        vibrant_on: { type: String, default: '1' },
        led_on: { type: String, default: '1' },
    },
    conversations: [
        {
            type: Schema.Types.ObjectId,
            ref: 'conversation',
        },
    ],
    notifications: [
        {
            type: Schema.Types.ObjectId,
            ref: 'notification',
        },
    ],
    not_suggest: [
        {
            type: Schema.Types.ObjectId,
            ref: 'user',
        },
    ],
});

const User = mongoose.model('user', userSchema);

module.exports = User;
