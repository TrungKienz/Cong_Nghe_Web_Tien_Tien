const dotenv = require('dotenv');
dotenv.config();

const User = require('../models/user.model.js');
const Chat = require('../models/chat.model');

const statusCode = require('../constants/statusCode.constant.js');
const statusMessage = require('../constants/statusMessage.constant.js');

const chat = async (req, res) => {
    try {
        const { partner_id, message } = req.body;
        const { _id } = req.jwtDecoded.data;

        // Fetch sender and partner data
        const [senderData, partnerData] = await Promise.all([
            User.findOne({ _id }),
            User.findOne({ _id: partner_id }),
        ]);

        // Create a new chat message
        const newMessage = await new Chat({
            partner_id,
            conversation: {
                message,
                unread: 1,
                created: Date.now(),
                sender: _id,
            },
            unread: 1,
            created: Date.now(),
            is_blocked: 0,
        }).save();

        // Update conversation arrays for sender and partner
        console.log(newMessage._id);
        senderData.conversations.push(newMessage._id);
        senderData.save();
        partnerData.conversations.push(newMessage._id);
        partnerData.save();

        return res.status(200).json({
            code: statusCode.OK,
            message: statusMessage.OK,
            data: newMessage,
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
    var { partner_id, conversation_id, index, count } = req.query;
    const { _id } = req.jwtDecoded.data;
    try {
        if (conversation_id && conversation_id.length > 1) {
            var chatData = await Chat.findById(conversation_id).populate({
                path: 'sender',
                select: 'username avatar',
                sort: {
                    created: -1,
                },
            });
            if (!chatData) {
                throw Error('nodata');
            }
            return res.status(200).json({
                code: statusCode.OK,
                message: statusMessage.OK,
                data: {
                    conversation_id: chatData._id,
                    conversation: chatData.conversation,
                    is_blocked: chatData.is_blocked == _id,
                },
            });
        } else if (partner_id && partner_id.length > 1) {
            console.log(_id, partner_id);
            var chatData1 = await Chat.findOne({
                partner_id: {
                    $all: [_id, partner_id],
                },
            });
            if (!chatData1) {
                var partnerData = await User.findById(partner_id);
                var userData = req.userDataPass;
                if (
                    !partnerData ||
                    partnerData.is_blocked ||
                    partnerData.blockedIds.includes(_id) ||
                    userData.blockedIds.includes(partner_id)
                ) {
                    throw Error('blocked or not existed');
                }

                var chatData = await new Chat({
                    partner_id: [partner_id, _id],
                    is_blocked: null,
                    created: Date.now(),
                }).save();
                partnerData.conversations.push(chatData._id);
                await partnerData.save();
                if (_id != partner_id) {
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
                    /*   server:
            userData.username + " want to message to " + partnerData.username, */
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
            throw Error('nodata');
        }
    } catch (error) {
        console.log(error);
        if (error.message == 'nodata') {
            return res.status(500).json({
                code: statusCode.NO_DATA_OR_END_OF_LIST_DATA,
                message: statusMessage.NO_DATA_OR_END_OF_LIST_DATA,
            });
        }
        return res.status(500).json({
            code: statusCode.UNKNOWN_ERROR,
            message: statusMessage.UNKNOWN_ERROR,
        });
    }
};

const getListConversation = async (req, res) => {
    var { index, count } = req.query;
    const { _id } = req.userDataPass;
    try {
        index = index ? index : 0;
        count = count ? count : 20;

        var userData = await User.findById(_id).populate({
            path: 'conversations',
            select: 'partner_id created is_blocked conversation',
            sort: {
                created: -1,
            },
            populate: {
                path: 'partner_id',
                select: 'username avatar',
            },
        });

        var numNewMessage = 0;
        userData.conversations.forEach((element) => {
            element.conversation =
                element.conversation[element.conversation.length - 1];
            if (element.conversation && element.conversation[0].unread == '1')
                numNewMessage += 1;
        });
        return res.status(200).json({
            code: statusCode.OK,
            message: statusMessage.OK,
            data: userData.conversations,
            numNewMessage: numNewMessage,
        });
    } catch (error) {
        console.log(error);
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
        var chatData = await Chat.findById(conversation_id).populate({
            path: 'partner_id',
            select: 'username avatar',
        });
        if (!chatData) {
            throw Error('notfound');
        }
        chatData.conversation = chatData.conversation.map((element) => {
            element.unread = '0';
            return element;
        });
        return res.status(200).json({
            code: statusCode.OK,
            message: statusMessage.OK,
            data: chatData,
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
            return res.status(500).json({
                code: statusCode.UNKNOWN_ERROR,
                message: statusMessage.UNKNOWN_ERROR,
            });
        }
    }
};

const deleteConversation = async (req, res) => {
    const { token, partner_id, conversation_id, message_id } = req.query;
    const { _id } = req.userDataPass;
    try {
        var chatData = await Chat.findByIdAndUpdate(conversation_id, {
            $pull: {
                partner_id: _id,
            },
        });
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
            return res.status(500).json({
                code: statusCode.UNKNOWN_ERROR,
                message: statusMessage.UNKNOWN_ERROR,
            });
        }
    }
};

const deleteMessage = async (req, res) => {
    const { token, partner_id, conversation_id, message_id } = req.query;
    const { _id } = req.userDataPass;
    try {
        var chatData = await Chat.findByIdAndUpdate(conversation_id, {
            $pull: {
                conversation: message_id,
            },
        });
        if (!chatData) {
            throw Error('nodata');
        }
        return res.status(200).json({
            code: statusCode.OK,
            message: statusMessage.OK,
            data: {
                conversation: chatData.conversation.slice(
                    Number(index),
                    Number(index) + Number(count)
                ),
                is_blocked: chatData.is_blocked == _id,
            },
        });
    } catch (error) {
        if (error.message == 'nodata') {
            return res.status(500).json({
                code: statusCode.NO_DATA_OR_END_OF_LIST_DATA,
                message: statusMessage.NO_DATA_OR_END_OF_LIST_DATA,
            });
        } else {
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
