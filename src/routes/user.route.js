const express = require('express');
const afterLogin = require('../controllers/user.controller.js');

const { isAuth } = require('../middlewares/auth.middleware.js');
const router = express.Router();

router.get('/', (req, res) => {
    // test private page
    console.log(req.jwtDecoded);
    return res.status(200).json('this is /user page');
});

/**
 * @openapi
 * /it4788/user/logout:
 *   post:
 *     tags:
 *       - API về tài khoản
 *     summary: Đăng xuất
 *     description: Endpoint để đăng xuất tài khoản.
 *     parameters:
 *       - name: token
 *         in: query
 *         description: Token người dùng.
 *         required: true
 *         schema:
 *           type: string
 *         example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjp7Il9pZCI6IjY1NjM4ZTE2ODc1OGIxNDA2MDUyNTRjOSIsImVtYWlsIjoibmhvbTA2QGdtYWlsLmNvbSJ9LCJpYXQiOjE3MDE2OTg2NzcsImV4cCI6MTcwMTc4NTA3N30.8PDQUAleC8uXFnqu35g2Lp98B7W5Q3sDA6rWpmtmYPA
 *     responses:
 *       '200':
 *         description: Đăng nhập thành công
 */
router.post('/logout', isAuth, afterLogin.logout);

/**
 * @openapi
 * /it4788/user/change_info_after_signup:
 *   post:
 *     tags:
 *       - API về tài khoản
 *     summary: Đổi thông tin tài khoản người dùng
 *     description: Endpoint Đổi thông tin tài khoản người dùng.
 *     parameters:
 *       - name: token
 *         in: query
 *         description: Token người dùng.
 *         required: true
 *         schema:
 *           type: string
 *         example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjp7Il9pZCI6IjY1NjM4ZTE2ODc1OGIxNDA2MDUyNTRjOSIsImVtYWlsIjoibmhvbTA2QGdtYWlsLmNvbSJ9LCJpYXQiOjE3MDE2OTg2NzcsImV4cCI6MTcwMTc4NTA3N30.8PDQUAleC8uXFnqu35g2Lp98B7W5Q3sDA6rWpmtmYPA
 *      - name: username
 *         in: query
 *         description: Tên người dùng.
 *         required: true
 *         schema:
 *           type: string
 *         example: Nhom06  
 * responses:
 *       '200':
 *         description: Đổi thông tin thành công
 */
router.post(
    '/change_info_after_signup',
    isAuth,
    afterLogin.changeInfoAfterSignup
);

/**
 * @openapi
 * /it4788/user/change_password:
 *   post:
 *     tags:
 *       - API về tài khoản
 *     summary: Đổi mật khẩu
 *     description: Endpoint để Đổi mật khẩu.
 *     parameters:
 *       - name: token
 *         in: query
 *         description: Token người dùng.
 *         required: true
 *         schema:
 *           type: string
 *         example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjp7Il9pZCI6IjY1NjM4ZTE2ODc1OGIxNDA2MDUyNTRjOSIsImVtYWlsIjoibmhvbTA2QGdtYWlsLmNvbSJ9LCJpYXQiOjE3MDE2OTg2NzcsImV4cCI6MTcwMTc4NTA3N30.8PDQUAleC8uXFnqu35g2Lp98B7W5Q3sDA6rWpmtmYPA
 *       - name: password
 *         in: query
 *         description: Mật khẩu cũ.
 *         required: true
 *         schema:
 *           type: string
 *         example: 123456789
 *       - name: new_password
 *         in: query
 *         description: Mật khẩu mới.
 *         required: true
 *         schema:
 *           type: string
 *         example: 1234567899
 *     responses:
 *       '200':
 *         description: Đổi mật khẩu thành công
 */
router.post('/change_password', isAuth, afterLogin.change_password);


router.post('/get_push_settings', isAuth, afterLogin.get_push_settings);
router.post('/set_push_settings', isAuth, afterLogin.set_push_settings);
router.post('/set_block', isAuth, afterLogin.set_block);
router.post('/check_new_version', isAuth, afterLogin.check_new_version);

module.exports = router;
