const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const postSchema = new mongoose.Schema({
    described: {
        type: String,
        index: true,
    },
    created: Date,
    modified: Date,
    like: Number,
    disappointed: Number,
    disappointed_list: [{ type: Schema.Types.ObjectId }],
    kudos: Number,
    kudos_list: [{ type: Schema.Types.ObjectId }],
    comment: Number,
    comment_list: [
        {
            type: Schema.Types.ObjectId,
            ref: 'comment',
        },
    ],
    mark_list: [
        {
            type: Schema.Types.ObjectId,
            ref: 'mark',
        },
    ],
    marker_list: [
        {
            type: Schema.Types.ObjectId,
            ref: 'user',
        },
    ],
    is_liked: Boolean,
    like_list: [
        {
            type: Schema.Types.ObjectId,
            ref: 'user',
        },
    ],
    image: [
        {
            url: String,
        },
    ],
    video: {
        thumb: String,
        url: String,
    },
    thumb: [
        {
            url: String,
        },
    ],
    //
    author: { type: Schema.Types.ObjectId, ref: 'user' },
    state: String,
    status: String,
    is_blocked: String,
    can_edit: String,
    banned: String,
    can_comment: String,
    // url: String,
    // messages: Array,
    keyword: String,
});
const post = mongoose.model('post', postSchema);

module.exports = post;
