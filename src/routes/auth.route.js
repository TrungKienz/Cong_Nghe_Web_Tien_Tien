const express = require("express");
const router = express.Router();

const authController = require("../controllers/auth.controller.js");

router.post("/signup", authController.signup);
router.post("/login", authController.login);

router.post("/get_verify_code", authController.getVerifyCode);
router.post("/check_verify_code", authController.checkVerifyCode);

module.exports = router;
