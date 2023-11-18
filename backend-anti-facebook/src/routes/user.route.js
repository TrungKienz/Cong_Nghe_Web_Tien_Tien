const express = require('express');
const afterLogin = require('../controllers/user.controller.js');
const { isAuth } = require('../middlewares/auth.middleware.js');
const router = express.Router();

router.get('/', (req, res) => {
    // test private page
    console.log(req.jwtDecoded);
    return res.status(200).json('this is /user page');
});
router.post('/logout', isAuth, afterLogin.logout);
router.post(
    '/change_info_after_signup',
    isAuth,
    afterLogin.changeInfoAfterSignup
);
router.post('/change_password', isAuth, afterLogin.change_password);
router.post('/getPushSettings', isAuth, afterLogin.getPushSettings);
router.post('/setPushSettings', isAuth, afterLogin.setPushSettings);
router.post('/setBlock', isAuth, afterLogin.setBlock);
router.post('/check_new_version', isAuth, afterLogin.checkNewVersion);

module.exports = router;
