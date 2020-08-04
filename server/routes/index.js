const express = require('express')
const router = express.Router()
const userController = require('../controllers/user')
const historyController = require('../controllers/history')
const paymentController = require('../controllers/payment')
const categoryController = require('../controllers/category')

const routerGen = (controller) => {
  const router = express.Router()
  router.post('/', controller.create)
  router.get('/', controller.findAll)
  router.put('/', controller.update)
  router.delete('/:id', controller.delete)
  return router
}

const { authenticate, isAuthenticated } = require('../utils/auth')

router.post('/user/login', authenticate(), userController.findById)
router.post('/user', userController.create)

// router.use(isAuthenticated)

router.use('/history', routerGen(historyController))
router.use('/payment', routerGen(paymentController))
router.use('/category', routerGen(categoryController))

/* GET home page. */
router.get('/', function (req, res) {
  res.render('index.html')
})

module.exports = router
