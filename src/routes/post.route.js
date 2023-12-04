const express = require('express');
const router = express.Router();

const postController = require('../controllers/post.controller.js');
const { isAuth } = require('../middlewares/auth.middleware.js');
const { isValidate } = require('../middlewares/validated.middleware.js')

router.post('/add_post', isAuth, postController.addPost);
/**
 * @openapi
 * /it4788/post/add_post:
 *   post:
 *     tags:
 *       - API về POST
 *     summary: add_post
 *     description: Endpoint để add_post.
 *     parameters:
 *       - name: token
 *         in: query
 *         description: Token người dùng.
 *         required: true
 *         schema:
 *           type: string
 *         example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjp7Il9pZCI6IjY1NjM4ZTE2ODc1OGIxNDA2MDUyNTRjOSIsImVtYWlsIjoibmhvbTA2QGdtYWlsLmNvbSJ9LCJpYXQiOjE3MDE2OTg2NzcsImV4cCI6MTcwMTc4NTA3N30.8PDQUAleC8uXFnqu35g2Lp98B7W5Q3sDA6rWpmtmYPA
 *       - name: described
 *         in: query
 *         description: described.
 *         required: true
 *         schema:
 *           type: string
 *         example: Test delete post 4
 *       - name: status
 *         in: query
 *         description: status.
 *         required: true
 *         schema:
 *           type: string
 *         example: Vui vẻ
 *     responses:
 *       '200':
 *         description: Đổi mật khẩu thành công
 */
router.post('/get_list_posts', isAuth, postController.getListPosts);
/**
 * @openapi
 * /it4788/post/get_list_posts:
 *   post:
 *     tags:
 *       - API về POST
 *     summary: get_list_posts
 *     description: Endpoint để get_list_posts.
 *     parameters:
 *       - name: token
 *         in: query
 *         description: Token người dùng.
 *         required: true
 *         schema:
 *           type: string
 *         example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjp7Il9pZCI6IjY1NjM4ZTE2ODc1OGIxNDA2MDUyNTRjOSIsImVtYWlsIjoibmhvbTA2QGdtYWlsLmNvbSJ9LCJpYXQiOjE3MDE2OTg2NzcsImV4cCI6MTcwMTc4NTA3N30.8PDQUAleC8uXFnqu35g2Lp98B7W5Q3sDA6rWpmtmYPA
 *       - name: user_id
 *         in: query
 *         description: user_id.
 *         required: true
 *         schema:
 *           type: string
 *         example: 6558fca766393b22cc86ce9a
 *       - name: in_campaign
 *         in: query
 *         description: in_campaign.
 *         required: true
 *         schema:
 *           type: string
 *         example: 1
 *       - name: campaign_id
 *         in: query
 *         description: campaign_id.
 *         required: true
 *         schema:
 *           type: string
 *         example: 1
 *       - name: last_id
 *         in: query
 *         description: last_id.
 *         required: true
 *         schema:
 *           type: string
 *         example: 1
 *       - name: count
 *         in: query
 *         description: count.
 *         required: true
 *         schema:
 *           type: string
 *         example: 10
 *       - name: index
 *         in: query
 *         description: index.
 *         required: true
 *         schema:
 *           type: string
 *         example: 1
 *     responses:
 *       '200':
 *         description: Đổi mật khẩu thành công
 */
router.post('/get_list_videos', isAuth, postController.getListVideo);

/**
 * @openapi
 * /it4788/post/get_list_videos:
 *   post:
 *     tags:
 *       - API về POST
 *     summary: get_list_posts
 *     description: Endpoint để get_list_posts.
 *     parameters:
 *       - name: token
 *         in: query
 *         description: Token người dùng.
 *         required: true
 *         schema:
 *           type: string
 *         example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjp7Il9pZCI6IjY1NjM4ZTE2ODc1OGIxNDA2MDUyNTRjOSIsImVtYWlsIjoibmhvbTA2QGdtYWlsLmNvbSJ9LCJpYXQiOjE3MDE2OTg2NzcsImV4cCI6MTcwMTc4NTA3N30.8PDQUAleC8uXFnqu35g2Lp98B7W5Q3sDA6rWpmtmYPA
 *       - name: user_id
 *         in: query
 *         description: user_id.
 *         required: true
 *         schema:
 *           type: string
 *         example: 6558fca766393b22cc86ce9a
 *       - name: in_campaign
 *         in: query
 *         description: in_campaign.
 *         required: true
 *         schema:
 *           type: string
 *         example: 1
 *       - name: campaign_id
 *         in: query
 *         description: campaign_id.
 *         required: true
 *         schema:
 *           type: string
 *         example: 1
 *       - name: last_id
 *         in: query
 *         description: last_id.
 *         required: true
 *         schema:
 *           type: string
 *         example: 1
 *       - name: count
 *         in: query
 *         description: count.
 *         required: true
 *         schema:
 *           type: string
 *         example: 10
 *       - name: index
 *         in: query
 *         description: index.
 *         required: true
 *         schema:
 *           type: string
 *         example: 1
 *     responses:
 *       '200':
 *         description: Đổi mật khẩu thành công
 */
router.post('/get_post', isAuth, postController.getPost);

/**
 * @openapi
 * /it4788/post/get_post:
 *   post:
 *     tags:
 *       - API về POST
 *     summary: get_list_posts
 *     description: Endpoint để get_list_posts.
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
 *         example: 6558fca766393b22cc86ce9a
 *     responses:
 *       '200':
 *         description: Đổi mật khẩu thành công
 */
router.post('/edit_post', isAuth, postController.editPost);

/**
 * @openapi
 * /it4788/post/edit_post:
 *   post:
 *     tags:
 *       - API về POST
 *     summary: edit_post
 *     description: Endpoint để edit_post.
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
 *         example: 6558fca766393b22cc86ce9a
 *       - name: described
 *         in: query
 *         description: described.
 *         required: true
 *         schema:
 *           type: string
 *         example: 6558fca766393b22cc86ce9a
 *       - name: status
 *         in: query
 *         description: status.
 *         required: true
 *         schema:
 *           type: string
 *         example: 6558fca766393b22cc86ce9a
 *       - name: image_del
 *         in: query
 *         description: image_del.
 *         required: true
 *         schema:
 *           type: string
 *         example: 6558fca766393b22cc86ce9a
 *       - name: image_sort
 *         in: query
 *         description: image_sort.
 *         required: true
 *         schema:
 *           type: string
 *         example: 6558fca766393b22cc86ce9a
 *       - name: auto_accept
 *         in: query
 *         description: auto_accept.
 *         required: true
 *         schema:
 *           type: string
 *         example: 6558fca766393b22cc86ce9a
 *       - name: image
 *         in: query
 *         description: image.
 *         required: true
 *         schema:
 *           type: string
 *         example: 6558fca766393b22cc86ce9a
 *       - name: video
 *         in: query
 *         description: video.
 *         required: true
 *         schema:
 *           type: string
 *         example: 6558fca766393b22cc86ce9a
 *     responses:
 *       '200':
 *         description: Đổi mật khẩu thành công
 */
router.post('/delete_post', isAuth, postController.deletePost);
/**
 * @openapi
 * /it4788/post/delete_post:
 *   post:
 *     tags:
 *       - API về POST
 *     summary: delete_post
 *     description: Endpoint để delete_post.
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
 *         example: 6558fca766393b22cc86ce9a
 *     responses:
 *       '200':
 *         description: Đổi mật khẩu thành công
 */
router.post('/report_post', isAuth, postController.reportPost);
/**
 * @openapi
 * /it4788/post/report_post:
 *   post:
 *     tags:
 *       - API về POST
 *     summary: report_post
 *     description: Endpoint để report_post.
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
 *         example: 6558fca766393b22cc86ce9a
 *       - name: subject
 *         in: query
 *         description: subject.
 *         required: true
 *         schema:
 *           type: string
 *         example: 6558fca766393b22cc86ce9a
 *       - name: details
 *         in: query
 *         description: details.
 *         required: true
 *         schema:
 *           type: string
 *         example: 6558fca766393b22cc86ce9a
 *     responses:
 *       '200':
 *         description: Đổi mật khẩu thành công
 */
router.post('/feel', isAuth, postController.feel);

/**
 * @openapi
 * /it4788/post/feel:
 *   post:
 *     tags:
 *       - API về POST
 *     summary: feel
 *     description: Endpoint để feel.
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
 *         example: 6558fca766393b22cc86ce9a
 *       - name: type
 *         in: query
 *         description: type.
 *         required: true
 *         schema:
 *           type: string
 *         example: 6558fca766393b22cc86ce9a
 *     responses:
 *       '200':
 *         description: Đổi mật khẩu thành công
 */
router.post('/search', isAuth, postController.search);

/**
 * @openapi
 * /it4788/post/search:
 *   post:
 *     tags:
 *       - API về POST
 *     summary: search
 *     description: Endpoint để search.
 *     parameters:
 *       - name: token
 *         in: query
 *         description: Token người dùng.
 *         required: true
 *         schema:
 *           type: string
 *         example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjp7Il9pZCI6IjY1NjM4ZTE2ODc1OGIxNDA2MDUyNTRjOSIsImVtYWlsIjoibmhvbTA2QGdtYWlsLmNvbSJ9LCJpYXQiOjE3MDE2OTg2NzcsImV4cCI6MTcwMTc4NTA3N30.8PDQUAleC8uXFnqu35g2Lp98B7W5Q3sDA6rWpmtmYPA
 *       - name: user_id
 *         in: query
 *         description: user_id.
 *         required: true
 *         schema:
 *           type: string
 *         example: 6558fca766393b22cc86ce9a
 *       - name: keyword
 *         in: query
 *         description: keyword.
 *         required: true
 *         schema:
 *           type: string
 *         example: 6558fca766393b22cc86ce9a
 *       - name: index
 *         in: query
 *         description: index.
 *         required: true
 *         schema:
 *           type: string
 *         example: 6558fca766393b22cc86ce9a
 *       - name: count
 *         in: query
 *         description: count.
 *         required: true
 *         schema:
 *           type: string
 *         example: 6558fca766393b22cc86ce9a
 *     responses:
 *       '200':
 *         description: Đổi mật khẩu thành công
 */
router.post('/get_saved_search', isAuth, postController.get_saved_search);

/**
 * @openapi
 * /it4788/post/get_saved_search:
 *   post:
 *     tags:
 *       - API về POST
 *     summary: get_saved_search
 *     description: Endpoint để get_saved_search.
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
 *         example: 6558fca766393b22cc86ce9a
 *       - name: count
 *         in: query
 *         description: count.
 *         required: true
 *         schema:
 *           type: string
 *         example: 6558fca766393b22cc86ce9a
 *     responses:
 *       '200':
 *         description: Đổi mật khẩu thành công
 */
router.post('/del_saved_search', isAuth, postController.del_saved_search);

/**
 * @openapi
 * /it4788/post/del_saved_search:
 *   post:
 *     tags:
 *       - API về POST
 *     summary: del_saved_search
 *     description: Endpoint để del_saved_search.
 *     parameters:
 *       - name: token
 *         in: query
 *         description: Token người dùng.
 *         required: true
 *         schema:
 *           type: string
 *         example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjp7Il9pZCI6IjY1NjM4ZTE2ODc1OGIxNDA2MDUyNTRjOSIsImVtYWlsIjoibmhvbTA2QGdtYWlsLmNvbSJ9LCJpYXQiOjE3MDE2OTg2NzcsImV4cCI6MTcwMTc4NTA3N30.8PDQUAleC8uXFnqu35g2Lp98B7W5Q3sDA6rWpmtmYPA
 *       - name: search_id
 *         in: query
 *         description: search_id.
 *         required: true
 *         schema:
 *           type: string
 *         example: 6558fca766393b22cc86ce9a
 *       - name: all
 *         in: query
 *         description: all.
 *         required: true
 *         schema:
 *           type: string
 *         example: 0
 *     responses:
 *       '200':
 *         description: Đổi mật khẩu thành công
 */

// router.post("/like", postController.like);
// router.post("/check_new_item", fiveController.checkNewItem);

module.exports = router;
