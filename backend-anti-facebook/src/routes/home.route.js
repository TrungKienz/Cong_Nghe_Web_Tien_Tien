const express = require('express');
const router = express.Router();

const homeController = require('../controllers/home.controller.js');
const { isAuth } = require('../middlewares/auth.middleware.js');

router.post('/get_list_posts', isAuth, homeController.getListPosts);
router.post('/check_new_item', isAuth, homeController.checkNewItem);

router.post('/get_notification', isAuth, homeController.getNotification);
router.post(
    '/set_read_notification',
    isAuth,
    homeController.setReadNotification
);
router.post('/set_devtoken', isAuth, homeController.setDevToken);
router.post('/get_user_info', isAuth, homeController.getUserInfo);
router.post('/set_user_info', isAuth, homeController.setUserInfo);

module.exports = router;
