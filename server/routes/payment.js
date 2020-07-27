const express = require('express')
const router = express.Router()

const paymentController = require('../controllers/payment')

router.post('/', paymentController.create)
router.put('/', paymentController.update)
router.delete('/:id', paymentController.delete)

module.exports = router
