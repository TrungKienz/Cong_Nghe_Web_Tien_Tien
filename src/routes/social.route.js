const express = require('express');
const controller = require('../controllers/social.controller.js');
const { isAuth } = require('../middlewares/auth.middleware.js');
const router = express.Router();

router.post(
    '/get_list_suggested_friends',
    isAuth,
    controller.getListOfFriendSuggestions
);
/**
 * @openapi
 * /it4788/social/get_list_suggested_friends:
 *   post:
 *     tags:
 *       - API về social
 *     summary: get_list_suggested_friends
 *     description: Endpoint để get_list_suggested_friends.
 *     parameters:
 *       - name: token
 *         in: query
 *         description: token.
 *         required: true
 *         schema:
 *           type: string
 *         example: 
 *       - name: count
 *         in: query
 *         description: count.
 *         required: true
 *         schema:
 *           type: string
 *         example: 0
 *       - name: count
 *         in: index
 *         description: index.
 *         required: true
 *         schema:
 *           type: string
 *         example: 0
 *     responses:
 *       '200':
 *         description: Đổi mật khẩu thành công
 */
router.post('/set_request_friend', isAuth, controller.addFriend);

/**
 * @openapi
 * /it4788/social/set_request_friend:
 *   post:
 *     tags:
 *       - API về social
 *     summary: set_request_friend
 *     description: Endpoint để set_request_friend.
 *     parameters:
 *       - name: token
 *         in: query
 *         description: token.
 *         required: true
 *         schema:
 *           type: string
 *         example: 
 *       - name: user_id
 *         in: query
 *         description: user_id.
 *         required: true
 *         schema:
 *           type: string
 *         example: 0
 *     responses:
 *       '200':
 *         description: Đổi mật khẩu thành công
 */
router.post(
    '/get_requested_friends',
    isAuth,
    controller.getListOfFriendRequests
);


/**
 * @openapi
 * /it4788/social/get_requested_friends:
 *   post:
 *     tags:
 *       - API về social
 *     summary: get_requested_friends
 *     description: Endpoint để get_requested_friends.
 *     parameters:
 *       - name: token
 *         in: query
 *         description: token.
 *         required: true
 *         schema:
 *           type: string
 *         example: 
 *       - name: count
 *         in: query
 *         description: count.
 *         required: true
 *         schema:
 *           type: string
 *         example: 0
 *       - name: count
 *         in: index
 *         description: index.
 *         required: true
 *         schema:
 *           type: string
 *         example: 0
 *     responses:
 *       '200':
 *         description: Đổi mật khẩu thành công
 */
router.post('/get_user_friends', isAuth, controller.getListOfUserFriends);

/**
 * @openapi
 * /it4788/social/get_user_friends:
 *   post:
 *     tags:
 *       - API về social
 *     summary: get_user_friends
 *     description: Endpoint để get_user_friends.
 *     parameters:
 *       - name: token
 *         in: query
 *         description: token.
 *         required: true
 *         schema:
 *           type: string
 *         example: 
 *       - name: user_id
 *         in: query
 *         description: user_id.
 *         required: true
 *         schema:
 *           type: string
 *         example: 
 *       - name: count
 *         in: query
 *         description: count.
 *         required: true
 *         schema:
 *           type: string
 *         example: 0
 *       - name: count
 *         in: index
 *         description: index.
 *         required: true
 *         schema:
 *           type: string
 *         example: 0
 *     responses:
 *       '200':
 *         description: Đổi mật khẩu thành công
 */
router.post('/set_accept_friend', isAuth, controller.processFriendRequest);

/**
 * @openapi
 * /it4788/social/set_accept_friend:
 *   post:
 *     tags:
 *       - API về social
 *     summary: set_accept_friend
 *     description: Endpoint để set_accept_friend.
 *     parameters:
 *       - name: token
 *         in: query
 *         description: token.
 *         required: true
 *         schema:
 *           type: string
 *         example: 
 *       - name: user_id
 *         in: query
 *         description: user_id.
 *         required: true
 *         schema:
 *           type: string
 *         example: 
 *       - name: is_accept
 *         in: query
 *         description: is_accept.
 *         required: true
 *         schema:
 *           type: string
 *         example: 0
 *     responses:
 *       '200':
 *         description: Đổi mật khẩu thành công
 */
router.post('/get_list_blocks', isAuth,controller.getListOfBlockedUsers);

/**
 * @openapi
 * /it4788/social/get_list_blocks:
 *   post:
 *     tags:
 *       - API về social
 *     summary: get_list_blocks
 *     description: Endpoint để get_list_blocks.
 *     parameters:
 *       - name: token
 *         in: query
 *         description: token.
 *         required: true
 *         schema:
 *           type: string
 *         example: 
 *       - name: count
 *         in: query
 *         description: count.
 *         required: true
 *         schema:
 *           type: string
 *         example: 
 *       - name: index
 *         in: query
 *         description: index.
 *         required: true
 *         schema:
 *           type: string
 *         example: 0
 *     responses:
 *       '200':
 *         description: Đổi mật khẩu thành công
 */

module.exports = router;
