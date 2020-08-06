const express = require('express')
const router = express.Router()
const historyController = require('../controllers/history')
const paymentController = require('../controllers/payment')
const categoryController = require('../controllers/category')
const { authenticate, isAuthenticated } = require('../utils/auth')

const routerGen = (controller) => {
  const router = express.Router()
  router.use(isAuthenticated)
  router.post('/', controller.create)
  router.get('/', controller.findAll)
  router.put('/', controller.update)
  router.delete('/:id', controller.delete)
  return router
}

router.get('/auth/github', authenticate)
router.get('/auth/github/callback', authenticate, (req, res) =>
  res.redirect('/')
)

router.get('/', (req, res) => res.render('index.html'))

router.use('/history', routerGen(historyController))
router.use('/payment', routerGen(paymentController))
router.use('/category', routerGen(categoryController))

module.exports = router
