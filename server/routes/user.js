const express = require('express')
const router = express.Router()

const userController = require('../controllers/user')
const { authenticate, isAuthenticated } = require('../utils/auth')

router.post('/login', authenticate(), userController.findById)
router.post('/', userController.create)

router.use(isAuthenticated)

module.exports = router
