const express = require('express');
const router = express.Router();
const multer = require('multer');
const authController = require('../controllers/auth.controller.js');

/**
 * @openapi
 * /it4788/auth/signup:
 *   post:
 *     tags:
 *       - API về tài khoản
 *     summary: Đăng ký tài khoản hệ thống
 *     description: Endpoint để đăng ký tài khoản trong hệ thống.
 *     parameters:
 *       - name: email
 *         in: query
 *         description: Địa chỉ email người dùng.
 *         required: true
 *         schema:
 *           type: string
 *         example: nhom06@gmail.com
 *       - name: password
 *         in: query
 *         description: Mật khẩu người dùng.
 *         required: true
 *         schema:
 *           type: string
 *         example: 123456789
 *       - name: uuid
 *         in: query
 *         description: ID máy người dùng.
 *         required: true
 *         schema:
 *           type: string
 *         example: 12345
 *     responses:
 *       '200':
 *         description: Đăng ký thành công
 */
router.post('/signup', authController.signup);

/**
 * @openapi
 * /it4788/auth/login:
 *   post:
 *     tags:
 *       - API về tài khoản
 *     summary: Đăng nhập vào hệ thống
 *     description: Endpoint để đăng nhập vào trong hệ thống.
 *     parameters:
 *       - name: email
 *         in: query
 *         description: Địa chỉ email người dùng.
 *         required: true
 *         schema:
 *           type: string
 *         example: nhom06@gmail.com
 *       - name: password
 *         in: query
 *         description: Mật khẩu người dùng.
 *         required: true
 *         schema:
 *           type: string
 *         example: 123456789
 *     responses:
 *       '200':
 *         description: Đăng nhập thành công
 */
router.post('/login', authController.login);

/**
 * @openapi
 * /it4788/auth/get_verify_code:
 *   post:
 *     tags:
 *       - API về tài khoản
 *     summary: Active tài khoản
 *     description: Endpoint để active tài khoản.
 *     parameters:
 *       - name: email
 *         in: query
 *         description: Địa chỉ email người dùng.
 *         required: true
 *         schema:
 *           type: string
 *         example: nhom06@gmail.com
 *     responses:
 *       '200':
 *         description: Đăng nhập thành công
 */
router.post('/get_verify_code', authController.getVerifyCode);

/**
 * @openapi
 * /it4788/auth/check_verify_code:
 *   post:
 *     tags:
 *       - API về tài khoản
 *     summary: Kiểm tra code active
 *     description: Endpoint để active tài khoản.
 *     parameters:
 *       - name: email
 *         in: query
 *         description: Địa chỉ email người dùng.
 *         required: true
 *         schema:
 *           type: string
 *         example: nhom06@gmail.com
 *       - name: code_verify
 *         in: query
 *         description: Mã xác minh đã gửi về khi dùng api get verify code.
 *         required: true
 *         schema:
 *           type: string
 *         example: 123456
 *     responses:
 *       '200':
 *         description: Đăng nhập thành công
 */
router.post('/check_verify_code', authController.checkVerifyCode);

module.exports = router;
