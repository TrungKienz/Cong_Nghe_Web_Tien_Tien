const express = require("express");
const router = express.Router();

const commentController = require("../controllers/comment.controller.js");
const { isAuth } = require("../middlewares/auth.middleware.js");


router.post("/get_mark_comment", isAuth, commentController.getMarkComment);
router.post("/set_mark_comment", isAuth, commentController.setMarkComment);


module.exports = router;
