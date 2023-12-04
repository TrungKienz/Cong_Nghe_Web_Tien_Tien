const express = require('express');
const router = express.Router();

const commentController = require('../controllers/comment.controller.js');
const { isAuth } = require('../middlewares/auth.middleware.js');
const { isValidate } = require('../middlewares/validated.middleware.js')

router.post('/get_mark_comment', isAuth, commentController.getMarkComment);
/**
 * @openapi
 * /it4788/comment/get_mark_comment:
 *   post:
 *     tags:
 *       - API về bình luận
 *     summary: get_mark_comment
 *     description: Endpoint để get_mark_comment.
 *     parameters:
 *       - name: token
 *         in: query
 *         description: Token người dùng.
 *         required: true
 *         schema:
 *           type: string
 *         example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjp7Il9pZCI6IjY1NjM4ZTE2ODc1OGIxNDA2MDUyNTRjOSIsImVtYWlsIjoibmhvbTA2QGdtYWlsLmNvbSJ9LCJpYXQiOjE3MDE2OTg2NzcsImV4cCI6MTcwMTc4NTA3N30.8PDQUAleC8uXFnqu35g2Lp98B7W5Q3sDA6rWpmtmYPA
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
 *         example: 3
 *     responses:
 *       '200':
 *         description: Đổi mật khẩu thành công
 */
router.post('/set_mark_comment', isAuth,commentController.setMarkComment);
/**
 * @openapi
 * /it4788/comment/set_mark_comment:
 *   post:
 *     tags:
 *       - API về bình luận
 *     summary: set_mark_comment
 *     description: Endpoint để set_mark_comment.
 *     parameters:
 *       - name: token
 *         in: query
 *         description: Token người dùng.
 *         required: true
 *         schema:
 *           type: string
 *         example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjp7Il9pZCI6IjY1NjM4ZTE2ODc1OGIxNDA2MDUyNTRjOSIsImVtYWlsIjoibmhvbTA2QGdtYWlsLmNvbSJ9LCJpYXQiOjE3MDE2OTg2NzcsImV4cCI6MTcwMTc4NTA3N30.8PDQUAleC8uXFnqu35g2Lp98B7W5Q3sDA6rWpmtmYPA
 *       - name: id
 *         in: query
 *         description: id.
 *         required: true
 *         schema:
 *           type: string
 *         example: 0
 *       - name: content
 *         in: query
 *         description: content.
 *         required: true
 *         schema:
 *           type: string
 *         example: 3
 *       - name: index
 *         in: query
 *         description: index.
 *         required: true
 *         schema:
 *           type: string
 *         example: 3
 *       - name: count
 *         in: query
 *         description: count.
 *         required: true
 *         schema:
 *           type: string
 *         example: 3
 *       - name: mark_id
 *         in: query
 *         description: mark_id.
 *         required: true
 *         schema:
 *           type: string
 *         example: 3
 *       - name: type
 *         in: query
 *         description: type.
 *         required: true
 *         schema:
 *           type: string
 *         example: 3
 *     responses:
 *       '200':
 *         description: Đổi mật khẩu thành công
 */

module.exports = router;
