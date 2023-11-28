const express = require('express');
const router = express.Router();

const postController = require('../controllers/post.controller.js');
const { isAuth } = require('../middlewares/auth.middleware.js');
const { isValidate } = require('../middlewares/validated.middleware.js')

router.post('/add_post', isAuth, isValidate, postController.addPost);
router.post('/get_list_posts', isAuth, isValidate, postController.getListPosts);
router.post('/get_list_videos', isAuth, isValidate, postController.getListVideo);
router.post('/get_post', isAuth, isValidate, postController.getPost);
router.post('/edit_post', isAuth, isValidate, postController.editPost);
router.post('/delete_post', isAuth, isValidate, postController.deletePost);
router.post('/report_post', isAuth, isValidate, postController.reportPost);
router.post('/feel', isAuth, isValidate, postController.feel);
router.post('/search', isAuth, isValidate, postController.search);
router.post('/get_saved_search', isAuth, isValidate, postController.get_saved_search);
router.post('/del_saved_search', isAuth, isValidate, postController.del_saved_search);

// router.post("/like", postController.like);
// router.post("/check_new_item", fiveController.checkNewItem);

module.exports = router;
