const express = require('express');
const router = express.Router();

const homeController = require('../controllers/home.controller.js');
const { isValidate } = require('../middlewares/validated.middleware.js');
const { isAuth } = require('../middlewares/auth.middleware.js');

router.post('/check_new_item', isAuth, isValidate, homeController.checkNewItem);

router.post('/get_notification', isAuth, isValidate, homeController.getNotification);
router.post(
    '/set_read_notification',
    isAuth, isValidate,
    homeController.setReadNotification
);
router.post('/set_devtoken', isAuth, isValidate, homeController.setDevToken);
router.post('/get_user_info', isAuth, isValidate, homeController.getUserInfo);
router.post('/set_user_info', isAuth, isValidate, homeController.setUserInfo);

module.exports = router;
