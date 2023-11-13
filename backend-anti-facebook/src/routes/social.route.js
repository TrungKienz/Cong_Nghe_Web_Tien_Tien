const express = require('express');
const controller = require('../controllers/social.controller.js');
const { isAuth } = require('../middlewares/auth.middleware.js');
const router = express.Router();

router.post(
    '/get_list_suggested_friends',
    isAuth,
    controller.getListOfFriendSuggestions
);
router.post('/set_request_friend', isAuth, controller.addFriend);
router.post(
    '/get_requested_friends',
    isAuth,
    controller.getListOfFriendRequests
);
router.post('/get_user_friends', isAuth, controller.getListOfUserFriends);
router.post('/set_accept_friend', isAuth, controller.processFriendRequest);

module.exports = router;
