const express = require('express');
const router = express.Router();

const conversationController = require('../controllers/conversation.controller.js');
const { isAuth } = require('../middlewares/auth.middleware.js');
const { isValidate } = require('../middlewares/validated.middleware.js');

router.post('/add_chat', isAuth, isValidate, conversationController.chat);
router.post(
    '/get_list_conversation',
    isAuth, isValidate,
    conversationController.getListConversation
);
router.post(
    '/get_conversation',
    isAuth, isValidate,
    conversationController.getConversation
);
router.post('/set_read_message', isAuth, conversationController.setReadMessage);
router.post(
    '/delete_conversation',
    isAuth, isValidate,
    conversationController.deleteConversation
);
router.post('/delete_message', isAuth, isValidate, conversationController.deleteMessage);
module.exports = router;
