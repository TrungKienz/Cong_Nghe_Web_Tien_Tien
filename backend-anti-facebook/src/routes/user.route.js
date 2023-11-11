const express = require('express')
const afterLogin = require('../controllers/user.controller.js')
const { isAuth } = require('../middlewares/auth.middleware.js')
const router = express.Router()

router.get('/', (req, res) => {
    // test private page
    console.log(req.jwtDecoded)
    return res.status(200).json('this is /user page')
})
router.post('/logout', isAuth, afterLogin.logout)
router.post(
    '/change_info_after_signup',
    isAuth,
    afterLogin.changeInfoAfterSignup
)

module.exports = router
