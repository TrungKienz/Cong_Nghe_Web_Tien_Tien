const mongoose = require('mongoose');

const Post = require('../models/post.model.js');
const User = require('../models/user.model.js');
const Comment = require('../models/comment.model');
const Mark = require('../models/mark.model.js');
const Notification = require('../models/notification.model');
const { addNotification } = require('./notification.controller.js');

const statusCode = require('./../constants/statusCode.constant.js');
const statusMessage = require('./../constants/statusMessage.constant.js');

const getMarkComment = async (req, res) => {
    const { id, count, index } = req.query;
    const { _id } = req.userDataPass;
    if (!count || !index) {
        return res.status(200).json({
            code: statusCode.PARAMETER_IS_NOT_ENOUGHT,
            message: statusMessage.PARAMETER_IS_NOT_ENOUGHT,
        })
    }
     
    try {

        if (!id) {
            throw new Error('params');
        }

        const postData = await Post.findOne({ _id: id }).populate({
            path: 'comment_list mark_list',
            populate: {
                path: 'poster',
                select: '_id username avatar',
            },
        });

        if (!postData) {
            throw new Error('notfound');
        }

        if (postData.is_blocked) {
            throw new Error('blocked');
        }

        const authorData = await User.findOne({ _id: postData.author });
        const userData = await User.findOne({ _id });

        if (authorData.blockedIds.includes(String(_id))) {
            throw new Error('authorblock');
        }

        if (userData.blockedIds.includes(String(postData.author))) {
            throw new Error('userblock');
        }

        const processList = async (list) => {
            return Promise.all(
                list.map(async (element) => {
                    const authorDataComment = await User.findOne({
                        _id: element.poster,
                    }).select('blockedIds');

                    if (
                        (authorDataComment.blockedIds &&
                            authorDataComment.blockedIds.includes(
                                String(_id)
                            )) ||
                        userData.blockedIds.includes(String(element.poster._id))
                    ) {
                        return null;
                    } else {
                        return element;
                    }
                })
            );
        };

        const validComment = await processList(postData.comment_list);
        const validMark = await processList(postData.mark_list);

        const resultComment = validComment.slice(
            Number(index),
            Number(index) + Number(count)
        );
        const resultMark = validMark.slice(
            Number(index),
            Number(index) + Number(count)
        );

        // Assuming resultMark and resultComment are arrays
        const mappedMark = resultMark.map((mark) => ({
            id: mark.mark_id || null,
            mark_content: mark.content || null,
            type_of_mark: mark.type || null,
            poster: {
                id: mark.poster?._id || null,
                name: mark.poster?.name || null,
                avatar: mark.poster?.avatar || null,
            },
        }));

        const mappedComment = resultComment.map((comment) => ({
            content: comment.content || null,
            created: comment.created || null,
            poster: {
                id: comment.poster?._id || null,
                name: comment.poster?.name || null,
                avatar: comment.poster?.avatar || null,
            },
        }));

        return res.status(200).json({
            code: statusCode.OK,
            message: statusMessage.OK,
            data: {
                mark: mappedMark,
                comments: mappedComment,
                is_blocked: postData.is_blocked || '0',
            },
        });
    } catch (err) {
        console.error(err);
        const errorResponse = {
            code: statusCode.UNKNOWN_ERROR,
            message: statusMessage.UNKNOWN_ERROR,
        };

        switch (err.message) {
            case 'params':
                errorResponse.code = statusCode.PARAMETER_VALUE_IS_INVALID;
                errorResponse.message =
                    statusMessage.PARAMETER_VALUE_IS_INVALID;
                break;
            case 'notfound':
                errorResponse.code = statusCode.POST_IS_NOT_EXISTED;
                errorResponse.message = statusMessage.POST_IS_NOT_EXISTED;
                break;
            case 'blocked':
                errorResponse.code =
                    statusCode.ACTION_HAS_BEEN_DONE_PREVIOUSLY_BY_THIS_USER;
                errorResponse.message =
                    statusMessage.ACTION_HAS_BEEN_DONE_PREVIOUSLY_BY_THIS_USER;
                break;
            case 'authorblock':
            case 'userblock':
                errorResponse.code = statusCode.NOT_ACCESS;
                errorResponse.message = statusMessage.NOT_ACCESS;
                break;
        }

        return res.status(200).json(errorResponse);
    }
};

const setMarkComment = async (req, res) => {
    const { id, content, index, count, mark_id, type } = req.query;
    const { _id } = req.userDataPass;

    if (!id || !index || !count || !content) {
        return res.status(200).json({
            code: statusCode.PARAMETER_IS_NOT_ENOUGHT,
            message: statusMessage.PARAMETER_IS_NOT_ENOUGHT,
        })
    }

    try {

        // Default values for index and count
        const parsedIndex = Number(index);
        const parsedCount = Number(count);

        // Find the post
        const post = await Post.findOne({ _id: id });

        // Check if the post exists
        if (!post) {
            throw new Error('notfound');
        }

        // Check if the post is blocked
        if (post.is_blocked) {
            throw new Error('action');
        }

        // Check if the author is blocked
        const authorData = await User.findOne({ _id: post.author });
        if (authorData.blockedIds.includes(String(_id))) {
            throw new Error('blocked');
        }

        // Check if the user has blocked the author
        const userData = await User.findOne({ _id });
        if (userData.blockedIds.includes(String(post.author))) {
            throw new Error('notaccess');
        }

        let resultData;

        if (mark_id && (type === '1' || type === '0')) {
            if (userData.mark_list.includes(id)) {
                return res.status(200).json({
                    code: statusCode.ACTION_HAS_BEEN_DONE_PREVIOUSLY_BY_THIS_USER,
                    message:
                        statusMessage.ACTION_HAS_BEEN_DONE_PREVIOUSLY_BY_THIS_USER,
                });
            }

            // Create and save a new mark
            const newMark = await Mark.create({
                poster: _id,
                mark_id,
                content,
                created: Date.now(),
                type: type.toString(),
            });
            var currentCoin = userData.coins;
            // Add the new mark to the post's mark_list
            post.mark_list.push(newMark._id);
            post.marker_list.push(_id);
            await post.save();
            userData.mark_list.push(id);
            userData.coins = currentCoin - 4;
            await userData.save();

            // Populate the post information with the new mark
            resultData = await populatePostInformation(id);
        } else if (mark_id || type) {
            return res.status(200).json({
                code: statusCode.PARAMETER_VALUE_IS_INVALID,
                message: statusMessage.PARAMETER_VALUE_IS_INVALID,
            });
        } else {
            // Create and save a new comment
            const newComment = await Comment.create({
                poster: _id,
                content,
                created: Date.now(),
            });

            // Add the new comment to the post's comment_list
            post.comment_list.push(newComment._id);
            await post.save();

            console.log('userData.friends', userData.friends);
            // Populate the post information with the new comment
            resultData = await populatePostInformation(id);

            const inputNotiData = {
                notificationType: 'comment',
                postId: id,
                username: userData.username,
                lastUpdate: Date.now(),
                avatar: userData.avatar,
            };

            const notiData = await addNotification(inputNotiData, _id);
            const objectNotiId = mongoose.Types.ObjectId(notiData._id);

            console.log('notiData', notiData);
            await User.findOneAndUpdate(
                { _id: post.author },
                {
                    $push: {
                        notifications: objectNotiId,
                    },
                },
                { new: true }
            );
        }

        const { mark_list, comment_list } = resultData;

        const resMark = mark_list.slice(parsedIndex, parsedIndex + parsedCount);
        const resComment = comment_list.slice(
            parsedIndex,
            parsedIndex + parsedCount
        );

        return res.status(200).json({
            code: statusCode.OK,
            message: statusMessage.OK,
            data: {
                mark: resMark,
                comment: resComment,
            },
            coins: (currentCoin - 4).toString(),
        });
    } catch (error) {
        console.error(error);

        // Handle errors and return appropriate responses
        const errorResponses = {
            params: {
                code: statusCode.PARAMETER_VALUE_IS_INVALID,
                message: statusMessage.PARAMETER_VALUE_IS_INVALID,
            },
            notfound: {
                code: statusCode.POST_IS_NOT_EXISTED,
                message: statusMessage.POST_IS_NOT_EXISTED,
            },
            action: {
                code: statusCode.ACTION_HAS_BEEN_DONE_PREVIOUSLY_BY_THIS_USER,
                message:
                    statusMessage.ACTION_HAS_BEEN_DONE_PREVIOUSLY_BY_THIS_USER,
            },
            blocked: {
                code: statusCode.NOT_ACCESS,
                message: statusMessage.NOT_ACCESS,
            },
            default: {
                code: statusCode.UNKNOWN_ERROR,
                message: statusMessage.UNKNOWN_ERROR,
            },
        };

        const response =
            errorResponses[error.message] || errorResponses.default;

        return res.status(200).json(response);
    }
};

async function populatePostInformation(id) {
    return await Post.findOne({ _id: id })
        .populate({
            path: 'mark_list',
            options: { sort: { created: -1 } },
            populate: {
                path: 'poster',
                select: '_id avatar username',
            },
        })
        .populate({
            path: 'comment_list',
            options: { sort: { created: -1 } },
            populate: {
                path: 'poster',
                select: '_id avatar username',
            },
        });
}

module.exports = {
    getMarkComment,
    setMarkComment,
};
