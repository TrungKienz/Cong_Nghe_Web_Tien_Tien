const dotenv = require('dotenv');
dotenv.config();

const User = require('../models/user.model.js');
const Conversation = require('../models/conversation.model.js');

const statusCode = require('../constants/statusCode.constant.js');
const statusMessage = require('../constants/statusMessage.constant.js');
const e = require('cors');

const chat = async (req, res) => {
    try {
        const { partner_id, message } = req.body;
        const { _id } = req.jwtDecoded.data;

        // Fetch sender and partner data
        const senderData = await User.findOne({ _id });
        const partnerData = await User.findOne({ _id: partner_id });
        const existingConversation = await Conversation.findOne({
            $or: [
                { partner_id: [partner_id, _id] },
                { partner_id: [_id, partner_id] },
            ],
        });

        if (existingConversation) {
            // Update existing conversation with a new message
            existingConversation.conversation.push({
                message,
                unread: 1,
                created: Date.now(),
                sender: _id,
            });
            await existingConversation.save();
        } else {
            // Create a new conversation
            const newConversation = await new Conversation({
                partner_id: [partner_id, _id],
                conversation: [
                    {
                        message,
                        unread: 1,
                        created: Date.now(),
                        sender: _id,
                    },
                ],
                unread: 1,
                created: Date.now(),
                is_blocked: 0,
            }).save();

            // Update conversation arrays for sender and partner
            senderData.conversations.push(newConversation._id);
            await senderData.save();

            partnerData.conversations.push(newConversation._id);
            await partnerData.save();
        }

        return res.status(200).json({
            code: statusCode.OK,
            message: statusMessage.OK,
            data: existingConversation,
        });
    } catch (error) {
        console.error('Error in chat function:', error);
        return res.status(500).json({
            code: statusCode.UNKNOWN_ERROR,
            message: statusMessage.UNKNOWN_ERROR,
        });
    }
};

const getConversation = async (req, res) => {
    try {
        const { partner_id, conversation_id, index, count } = req.query;
        const { _id } = req.jwtDecoded.data;
        index = index ? index : 0;
        count = count ? count : 20;
        if (!partner_id || !conversation_id) {
            return res.status(500).json({
                code: statusCode.PARAMETER_IS_NOT_ENOUGHT,
                message: statusMessage.PARAMETER_IS_NOT_ENOUGHT,
            });
        }
        if (conversation_id && conversation_id.length > 1) {
            const chatData = await Conversation.findById(conversation_id)
                .populate({
                    path: 'conversation.sender',
                    select: 'username avatar',
                })
                .exec();

            if (!chatData) {
                throw new Error('nodata');
            }

            const dataResConversation = chatData.conversation.map(
                (conversationElement) => {
                    const message_id = conversationElement._id
                        ? conversationElement._id
                        : null;

                    const senderId = conversationElement.sender._id
                        ? conversationElement.sender._id
                        : null;
                    const senderUsername = conversationElement.sender.username
                        ? conversationElement.sender.username
                        : null;
                    const senderAvatar = conversationElement.sender.avatar
                        ? conversationElement.sender.avatar
                        : null;

                    return {
                        message: conversationElement.message,
                        message_id: message_id,
                        unread: conversationElement.unread,
                        created: conversationElement.created,
                        sender: {
                            id: senderId,
                            username: senderUsername,
                            avatar: senderAvatar,
                        },
                    };
                }
            );

            return res.status(200).json({
                code: statusCode.OK,
                message: statusMessage.OK,
                data: {
                    // conversation_id: chatData._id,
                    conversation: dataResConversation.slice(
                        index,
                        index + count
                    ),
                    is_blocked: chatData.is_blocked == _id,
                },
            });
        } else if (partner_id && partner_id.length > 1) {
            const chatData1 = await Conversation.findOne({
                partner_id: {
                    $all: [_id, partner_id],
                },
            });

            if (!chatData1) {
                const partnerData = await User.findById(partner_id);
                const userData = req.userDataPass;

                if (
                    !partnerData ||
                    partnerData.is_blocked ||
                    partnerData.blockedIds.includes(_id) ||
                    userData.blockedIds.includes(partner_id)
                ) {
                    throw new Error('blocked or not existed');
                }

                const chatData = await new Chat({
                    partner_id: [partner_id, _id],
                    is_blocked: null,
                    created: Date.now(),
                }).save();

                partnerData.conversations.push(chatData._id);
                await partnerData.save();

                if (_id !== partner_id) {
                    await User.findByIdAndUpdate(_id, {
                        $push: {
                            conversations: chatData._id,
                        },
                    });
                }

                return res.status(200).json({
                    code: statusCode.OK,
                    message: statusMessage.OK,
                    data: {
                        conversation_id: chatData._id,
                        conversation: [],
                        is_blocked: false,
                    },
                });
            }

            return res.status(200).json({
                code: statusCode.OK,
                message: statusMessage.OK,
                data: {
                    conversation_id: chatData1._id,
                    conversation: chatData1.conversation,
                    is_blocked: chatData1.is_blocked == _id,
                },
            });
        } else {
            throw new Error('nodata');
        }
    } catch (error) {
        console.error(error);

        if (error.message === 'nodata') {
            return res.status(500).json({
                code: statusCode.NO_DATA_OR_END_OF_LIST_DATA,
                message: statusMessage.NO_DATA_OR_END_OF_LIST_DATA,
            });
        } else if (error.message === 'blocked or not existed') {
            return res.status(500).json({
                code: statusCode.BLOCKED_OR_NOT_EXISTED,
                message: statusMessage.BLOCKED_OR_NOT_EXISTED,
            });
        }

        return res.status(500).json({
            code: statusCode.UNKNOWN_ERROR,
            message: statusMessage.UNKNOWN_ERROR,
        });
    }
};

const getListConversation = async (req, res) => {
    try {
        const { _id } = req.userDataPass;
        let { index, count } = req.query;

        index = parseInt(index) || 0;
        count = parseInt(count) || 20;

        const userData = await User.findById(_id)
            .populate({
                path: 'conversations',
                select: 'partner_id created is_blocked conversation',
                options: {
                    sort: {
                        created: -1,
                    },
                },
                populate: {
                    path: 'partner_id',
                    select: 'username avatar',
                },
            })
            .exec();

        const dataRes = userData.conversations.map((element) => ({
            id: element._id,
            Partner: {
                id: element.partner_id[0]._id,
                username: element.partner_id[0].username,
                avatar: element.partner_id[0].avatar,
            },
            LastMessage: {
                message: element.conversation[0].message,
                created: element.conversation[0].created,
                unread: element.conversation[0].unread,
            },
        }));

        let numNewMessage = 0;
        userData.conversations.forEach((element) => {
            const lastConversation =
                element.conversation[element.conversation.length - 1];
            if (lastConversation && lastConversation.unread === '1') {
                numNewMessage += 1;
            }
        });

        return res.status(200).json({
            code: statusCode.OK,
            message: statusMessage.OK,
            data: dataRes,
            numNewMessage: numNewMessage.toString(),
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            code: statusCode.UNKNOWN_ERROR,
            message: statusMessage.UNKNOWN_ERROR,
        });
    }
};

const setReadMessage = async (req, res) => {
    const { partner_id, conversation_id } = req.query;
    const { _id } = req.userDataPass;

    try {
        var userData = req.userDataPass;
        if (!userData || userData.blockedIds.includes(partner_id)) {
            throw Error('nodata');
        }

        var chatData = await Conversation.findById(conversation_id).populate({
            path: 'partner_id',
            select: 'username avatar',
        });

        if (!chatData) {
            throw Error('notfound');
        }

        chatData.unread = '0';

        chatData.conversation.forEach((element) => {
            element.unread = '0';
        });

        // Save the changes to the database
        await chatData.save();

        return res.status(200).json({
            code: statusCode.OK,
            message: statusMessage.OK,
            // data: chatData,
            data: {},
        });
    } catch (error) {
        if (error.message == 'notfound') {
            return res.status(500).json({
                code: statusCode.POST_IS_NOT_EXISTED,
                message: statusMessage.POST_IS_NOT_EXISTED,
            });
        } else if (error.message == 'nodata') {
            return res.status(500).json({
                code: statusCode.NO_DATA_OR_END_OF_LIST_DATA,
                message: statusMessage.NO_DATA_OR_END_OF_LIST_DATA,
            });
        } else {
            console.log(error);
            return res.status(500).json({
                code: statusCode.UNKNOWN_ERROR,
                message: statusMessage.UNKNOWN_ERROR,
            });
        }
    }
};

const deleteConversation = async (req, res) => {
    const { token, partner_id, conversation_id } = req.query;
    const { _id } = req.userDataPass;
    try {
        const chatData = await Conversation.findOneAndDelete({
            _id: conversation_id,
        });
        const sendUserData = await User.findByIdAndUpdate(_id, {
            $pull: {
                conversations: conversation_id,
            },
        });
        const partnerUserData = await User.findByIdAndUpdate(
            { _id: partner_id },
            {
                $pull: {
                    conversations: conversation_id,
                },
            }
        );
        if (!chatData || !sendUserData || !partnerUserData) {
            throw Error('nodata');
        }
        return res.status(200).json({
            code: statusCode.OK,
            message: statusMessage.OK,
            data: {},
        });
    } catch (error) {
        if (error.message == 'nodata') {
            return res.status(500).json({
                code: statusCode.NO_DATA_OR_END_OF_LIST_DATA,
                message: statusMessage.NO_DATA_OR_END_OF_LIST_DATA,
            });
        } else {
            console.log(error);
            return res.status(500).json({
                code: statusCode.UNKNOWN_ERROR,
                message: statusMessage.UNKNOWN_ERROR,
            });
        }
    }
};

const deleteMessage = async (req, res) => {
    const { partner_id, conversation_id, message_id } = req.query;
    const { _id } = req.userDataPass;
    try {
        var chatData = await Conversation.findByIdAndUpdate(
            conversation_id,
            {
                $pull: {
                    conversation: { _id: message_id },
                },
            },
            { new: true } // This option returns the modified document rather than the original
        );

        console.log(chatData);
        if (!chatData) {
            throw Error('nodata');
        }
        return res.status(200).json({
            code: statusCode.OK,
            message: statusMessage.OK,
        });
    } catch (error) {
        if (error.message == 'nodata') {
            return res.status(500).json({
                code: statusCode.NO_DATA_OR_END_OF_LIST_DATA,
                message: statusMessage.NO_DATA_OR_END_OF_LIST_DATA,
            });
        } else {
            console.log(error);
            return res.status(500).json({
                code: statusCode.UNKNOWN_ERROR,
                message: statusMessage.UNKNOWN_ERROR,
            });
        }
    }
};

module.exports = {
    chat,
    getConversation,
    getListConversation,
    setReadMessage,
    deleteMessage,
    deleteConversation,
};
