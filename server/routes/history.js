const express = require('express')
const router = express.Router()

const historyController = require('../controllers/history')

router.post('/', historyController.create)
router.get('/', historyController.findAll)
router.put('/', historyController.update)
router.delete('/:id', historyController.delete)

module.exports = router
