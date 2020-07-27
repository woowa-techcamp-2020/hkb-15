const express = require('express')
const router = express.Router()
const historyRouter = require('./history')
const paymentRouter = require('./payment')
const userController = require('../controllers/user')

const { authenticate, isAuthenticated } = require('../utils/auth')

router.post('/user/login', authenticate(), userController.findById)
router.post('/user', userController.create)

// router.use(isAuthenticated)

router.use('/history', historyRouter)
router.use('/payment', paymentRouter)

/* GET home page. */
router.get('/', function (req, res) {
  res.render('index', { title: 'Express' })
})

module.exports = router
