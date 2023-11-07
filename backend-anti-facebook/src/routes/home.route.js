const express = require("express");
const router = express.Router();

const homeController = require("../controllers/home.controller.js");

router.post("/get_list_posts", homeController.getListPosts);
router.post("/check_new_item", fiveController.checkNewItem);


module.exports = router;
