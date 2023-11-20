const express = require('express');
const router = express.Router();

const postController = require('../controllers/post.controller.js');
const { isAuth } = require('../middlewares/auth.middleware.js');

router.post('/add_post', isAuth, postController.addPost);
router.post('/get_list_posts', isAuth, postController.getListPosts);
router.post('/get_post', isAuth, postController.getPost);
router.post('/edit_post', isAuth, postController.editPost);
router.post('/delete_post', isAuth, postController.deletePost);
router.post('/report_post', isAuth, postController.reportPost);
router.post('/feel', isAuth, postController.feel);
router.post('/search', isAuth, postController.search);
router.post('/get_saved_search', isAuth, postController.get_saved_search);
router.post('/del_saved_search', isAuth, postController.del_saved_search);

// router.post("/like", postController.like);
// router.post("/check_new_item", fiveController.checkNewItem);


module.exports = router;
