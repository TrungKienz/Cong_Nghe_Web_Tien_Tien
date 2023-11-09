const express = require("express");
const router = express.Router();

const homeController = require("../controllers/home.controller.js");
const { isAuth } = require("../middlewares/auth.middleware.js");


router.post("/get_list_posts", isAuth, homeController.getListPosts);
router.post("/check_new_item", isAuth, homeController.checkNewItem);


module.exports = router;
