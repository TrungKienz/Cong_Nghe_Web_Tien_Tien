const Post = require('../models/post.model.js');
const User = require('../models/user.model.js');
const Comment = require('../models/comment.model');
const Mark = require('../models/mark.model.js');
const Notification = require('../models/notification.model');

const statusCode = require('./../constants/statusCode.constant.js');
const statusMessage = require('./../constants/statusMessage.constant.js');

const getMarkComment = async (req, res) => {
    try {
        const { id, count = 20, index = 0 } = req.query;
        const { _id } = req.userDataPass;

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
                mappedMark,
                comments: mappedComment,
                is_blocked: postData.is_blocked || 'NO',
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
    try {
        var { id, content, index, count, mark_id, type } = req.query;
        const { _id } = req.userDataPass;

        // Default values for index and count
        index = index || 0;
        count = count || 20;

        // Find the post
        const result = await Post.findOne({ _id: id });

        // Check if the post exists
        if (!result) {
            throw new Error('notfound');
        }

        // Check if the post is blocked
        if (result.is_blocked) {
            throw new Error('action');
        }

        // Check if the author is blocked
        const authorData = await User.findOne({ _id: result.author });
        if (authorData.blockedIds.includes(String(_id))) {
            throw new Error('blocked');
        }

        // Check if the user has blocked the author
        const userData = await User.findOne({ _id: _id });
        if (userData.blockedIds.includes(String(result.author))) {
            throw new Error('notaccess');
        }

        if (mark_id && (type === '1' || type === '0')) {
            // Create and save a new mark
            const newMark = await Mark.create({
                poster: _id,
                mark_id: mark_id,
                content: content,
                created: Date.now(),
                type: type,
            });

            // Add the new mark to the post's mark_list
            result.mark_list.push(newMark._id);
            await result.save();

            // Populate the post information with the new mark
            const postInfor = await Post.findOne({ _id: id }).populate({
                path: 'mark_list',
                options: { sort: { created: -1 } },
                populate: {
                    path: 'poster',
                    select: '_id avatar username',
                },
            });

            return res.status(200).json({
                code: statusCode.OK,
                message: statusMessage.OK,
                data: postInfor.mark_list.slice(
                    Number(index),
                    Number(index) + Number(count)
                ),
            });
        } else if (mark_id || type) {
            return res.status(200).json({
                code: statusCode.PARAMETER_VALUE_IS_INVALID,
                message: statusMessage.PARAMETER_VALUE_IS_INVALID,
            });
        } else {
            // Create and save a new comment
            const newComment = await Comment.create({
                poster: _id,
                content: content,
                created: Date.now(),
            });

            // Add the new comment to the post's comment_list
            result.comment_list.push(newComment._id);
            await result.save();

            // Populate the post information with the new comment
            const postInfor = await Post.findOne({ _id: id }).populate({
                path: 'comment_list',
                options: { sort: { created: -1 } },
                populate: {
                    path: 'poster',
                    select: '_id avatar username',
                },
            });
            // Kệ cho Hùng code ở đây
            return res.status(200).json({
                code: statusCode.OK,
                message: statusMessage.OK,
                data: postInfor.comment_list.slice(
                    Number(index),
                    Number(index) + Number(count)
                ),
            });
        }
    } catch (error) {
        console.error(error);

        // Handle errors and return appropriate responses
        if (error.message === 'params') {
            return res.status(200).json({
                code: statusCode.PARAMETER_VALUE_IS_INVALID,
                message: statusMessage.PARAMETER_VALUE_IS_INVALID,
            });
        } else if (error.message === 'notfound') {
            return res.status(200).json({
                code: statusCode.POST_IS_NOT_EXISTED,
                message: statusMessage.POST_IS_NOT_EXISTED,
            });
        } else if (error.message === 'action') {
            return res.status(200).json({
                code: statusCode.ACTION_HAS_BEEN_DONE_PREVIOUSLY_BY_THIS_USER,
                message:
                    statusMessage.ACTION_HAS_BEEN_DONE_PREVIOUSLY_BY_THIS_USER,
            });
        } else if (error.message === 'blocked') {
            return res.status(200).json({
                code: statusCode.NOT_ACCESS,
                message: statusMessage.NOT_ACCESS,
            });
        } else {
            return res.status(200).json({
                code: statusCode.UNKNOWN_ERROR,
                message: statusMessage.UNKNOWN_ERROR,
            });
        }
    }
};

module.exports = {
    getMarkComment,
    setMarkComment,
};
