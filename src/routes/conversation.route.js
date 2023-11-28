const express = require('express');
const router = express.Router();

const conversationController = require('../controllers/conversation.controller.js');
const { isAuth } = require('../middlewares/auth.middleware.js');

router.post('/add_chat', isAuth, conversationController.chat);
router.post(
    '/get_list_conversation',
    isAuth,
    conversationController.getListConversation
);
router.post(
    '/get_conversation',
    isAuth,
    conversationController.getConversation
);
router.post('/set_read_message', isAuth, conversationController.setReadMessage);
router.post(
    '/delete_conversation',
    isAuth,
    conversationController.deleteConversation
);
router.post('/delete_message', isAuth, conversationController.deleteMessage);
module.exports = router;
