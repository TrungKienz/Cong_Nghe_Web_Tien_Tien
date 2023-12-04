const express = require('express');
const router = express.Router();

const homeController = require('../controllers/home.controller.js');
const { isAuth } = require('../middlewares/auth.middleware.js');

router.post('/check_new_item', isAuth, homeController.checkNewItem);
/**
 * @openapi
 * /it4788/home/check_new_item:
 *   post:
 *     tags:
 *       - API về màn hình trang chủ
 *     summary: check_new_item
 *     description: Endpoint để check_new_item.
 *     parameters:
 *       - name: last_id
 *         in: query
 *         description: last_id.
 *         required: true
 *         schema:
 *           type: string
 *         example: 
 *       - name: category_id
 *         in: query
 *         description: category_id.
 *         required: true
 *         schema:
 *           type: string
 *         example: 0
 *     responses:
 *       '200':
 *         description: Đổi mật khẩu thành công
 */

router.post('/get_notification', isAuth, homeController.getNotification);

/**
 * @openapi
 * /it4788/home/get_notification:
 *   post:
 *     tags:
 *       - API về màn hình trang chủ
 *     summary: get_notification
 *     description: Endpoint để get_notification.
 *     parameters:
 *       - name: token
 *         in: query
 *         description: token.
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
    '/set_read_notification',
    isAuth,
    homeController.setReadNotification
);

/**
 * @openapi
 * /it4788/home/set_read_notification:
 *   post:
 *     tags:
 *       - API về màn hình trang chủ
 *     summary: set_read_notification
 *     description: Endpoint để set_read_notification.
 *     parameters:
 *       - name: token
 *         in: query
 *         description: token.
 *         required: true
 *         schema:
 *           type: string
 *         example: 
 *       - name: notification_id
 *         in: query
 *         description: notification_id.
 *         required: true
 *         schema:
 *           type: string
 *         example: 0
 *     responses:
 *       '200':
 *         description: Đổi mật khẩu thành công
 */
router.post('/set_devtoken', isAuth, homeController.setDevToken);


/**
 * @openapi
 * /it4788/home/set_devtoken:
 *   post:
 *     tags:
 *       - API về màn hình trang chủ
 *     summary: set_devtoken
 *     description: Endpoint để set_devtoken.
 *     parameters:
 *       - name: token
 *         in: query
 *         description: token.
 *         required: true
 *         schema:
 *           type: string
 *         example: 
 *       - name: devtype
 *         in: query
 *         description: notification_id.
 *         required: true
 *         schema:
 *           type: string
 *         example: 0
 *       - name: devtoken
 *         in: query
 *         description: devtoken.
 *         required: true
 *         schema:
 *           type: string
 *         example: 0
 *     responses:
 *       '200':
 *         description: Đổi mật khẩu thành công
 */
router.post('/get_user_info', isAuth, homeController.getUserInfo);

/**
 * @openapi
 * /it4788/home/set_devtoken:
 *   post:
 *     tags:
 *       - API về màn hình trang chủ
 *     summary: set_devtoken
 *     description: Endpoint để set_devtoken.
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
router.post('/set_user_info', isAuth, homeController.setUserInfo);

/**
 * @openapi
 * /it4788/home/set_user_info:
 *   post:
 *     tags:
 *       - API về màn hình trang chủ
 *     summary: set_user_info
 *     description: Endpoint để set_user_info.
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
 *       - name: description
 *         in: query
 *         description: description.
 *         required: true
 *         schema:
 *           type: string
 *         example: 0
 *       - name: address
 *         in: query
 *         description: address.
 *         required: true
 *         schema:
 *           type: string
 *         example: 
 *       - name: city
 *         in: query
 *         description: city.
 *         required: true
 *         schema:
 *           type: string
 *         example: 0
 *       - name: country
 *         in: query
 *         description: country.
 *         required: true
 *         schema:
 *           type: string
 *         example: 0
 *       - name: link
 *         in: query
 *         description: link.
 *         required: true
 *         schema:
 *           type: string
 *         example: 0
 *     responses:
 *       '200':
 *         description: Đổi mật khẩu thành công
 */

module.exports = router;
