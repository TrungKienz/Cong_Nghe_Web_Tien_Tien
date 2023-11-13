const express = require('express')
const router = express.Router()

const chatController = require('../controllers/chat.controller.js')
const { isAuth } = require('../middlewares/auth.middleware.js')

router.post('/add_chat', isAuth, chatController.chat)
router.post('/get_list_conversation', isAuth, chatController.getListConversation)

module.exports = router
