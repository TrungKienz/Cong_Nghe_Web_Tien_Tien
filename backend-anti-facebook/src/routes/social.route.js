const express = require("express");
const controller = require("../controllers/social.controller.js");
const { isAuth } = require("../middlewares/auth.middleware.js");
const router = express.Router();

// router.get("/", (req, res) => {// test private page
//   console.log(req.jwtDecoded)
//   return res.status(200).json("this is /user page");
// });
router.post("/get_list_suggested_friends", isAuth, controller.getListOfFriendSuggestions);
router.post("/set_request_friend", isAuth, controller.addFriend);
// router.post("/change_info_after_signup", isAuth, afterLogin.changeInfoAfterSignup);

module.exports = router;
