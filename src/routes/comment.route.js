const express = require('express');
const router = express.Router();

const commentController = require('../controllers/comment.controller.js');
const { isAuth } = require('../middlewares/auth.middleware.js');
const { isValidate } = require('../middlewares/validated.middleware.js')

router.post('/get_mark_comment', isAuth, isValidate, commentController.getMarkComment);
router.post('/set_mark_comment', isAuth, isValidate,commentController.setMarkComment);

module.exports = router;
