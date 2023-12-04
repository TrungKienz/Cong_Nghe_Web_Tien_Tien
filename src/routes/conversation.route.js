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

/**
 * @openapi
 * /it4788/conversation/get_list_conversation:
 *   post:
 *     tags:
 *       - API về chat
 *     summary: get_list_conversation
 *     description: Endpoint để get_list_conversation.
 *     parameters:
 *       - name: token
 *         in: query
 *         description: token.
 *         required: true
 *         schema:
 *           type: string
 *         example: 
 *       - name: username
 *         in: query
 *         description: username.
 *         required: true
 *         schema:
 *           type: string
 *         example: 0
 *       - name: count
 *         in: query
 *         description: count.
 *         required: true
 *         schema:
 *           type: string
 *         example: 0
 *     responses:
 *       '200':
 *         description: Đổi mật khẩu thành công
 */
router.post(
    '/get_conversation',
    isAuth,
    conversationController.getConversation
);


/**
 * @openapi
 * /it4788/conversation/get_conversation:
 *   post:
 *     tags:
 *       - API về chat
 *     summary: get_conversation
 *     description: Endpoint để get_conversation.
 *     parameters:
 *       - name: token
 *         in: query
 *         description: token.
 *         required: true
 *         schema:
 *           type: string
 *         example: 
 *       - name: partner_id
 *         in: query
 *         description: partner_id.
 *         required: true
 *         schema:
 *           type: string
 *         example: 0
 *       - name: conversation_id
 *         in: query
 *         description: conversation_id.
 *         required: true
 *         schema:
 *           type: string
 *         example: 0
 *       - name: index
 *         in: query
 *         description: index.
 *         required: true
 *         schema:
 *           type: string
 *         example: 0
 *       - name: count
 *         in: query
 *         description: count.
 *         required: true
 *         schema:
 *           type: string
 *         example: 0
 *     responses:
 *       '200':
 *         description: Đổi mật khẩu thành công
 */
router.post('/set_read_message', isAuth, conversationController.setReadMessage);


/**
 * @openapi
 * /it4788/conversation/set_read_message:
 *   post:
 *     tags:
 *       - API về chat
 *     summary: set_read_message
 *     description: Endpoint để set_read_message.
 *     parameters:
 *       - name: token
 *         in: query
 *         description: token.
 *         required: true
 *         schema:
 *           type: string
 *         example: 
 *       - name: partner_id
 *         in: query
 *         description: partner_id.
 *         required: true
 *         schema:
 *           type: string
 *         example: 0
 *       - name: conversation_id
 *         in: query
 *         description: conversation_id.
 *         required: true
 *         schema:
 *           type: string
 *         example: 0
 *     responses:
 *       '200':
 *         description: Đổi mật khẩu thành công
 */
router.post(
    '/delete_conversation',
    isAuth,
    conversationController.deleteConversation
);

/**
 * @openapi
 * /it4788/conversation/delete_conversation:
 *   post:
 *     tags:
 *       - API về chat
 *     summary: delete_conversation
 *     description: Endpoint để delete_conversation.
 *     parameters:
 *       - name: token
 *         in: query
 *         description: token.
 *         required: true
 *         schema:
 *           type: string
 *         example: 
 *       - name: partner_id
 *         in: query
 *         description: partner_id.
 *         required: true
 *         schema:
 *           type: string
 *         example: 0
 *       - name: conversation_id
 *         in: query
 *         description: conversation_id.
 *         required: true
 *         schema:
 *           type: string
 *         example: 0
 *     responses:
 *       '200':
 *         description: Đổi mật khẩu thành công
 */
router.post('/delete_message', isAuth, conversationController.deleteMessage);

/**
 * @openapi
 * /it4788/conversation/delete_message:
 *   post:
 *     tags:
 *       - API về chat
 *     summary: delete_message
 *     description: Endpoint để delete_message.
 *     parameters:
 *       - name: token
 *         in: query
 *         description: token.
 *         required: true
 *         schema:
 *           type: string
 *         example: 
 *       - name: partner_id
 *         in: query
 *         description: partner_id.
 *         required: true
 *         schema:
 *           type: string
 *         example: 0
 *       - name: conversation_id
 *         in: query
 *         description: conversation_id.
 *         required: true
 *         schema:
 *           type: string
 *         example: 0
 *       - name: message_id
 *         in: query
 *         description: message_id.
 *         required: true
 *         schema:
 *           type: string
 *         example: 0
 *     responses:
 *       '200':
 *         description: Đổi mật khẩu thành công
 */
module.exports = router;
