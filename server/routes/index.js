const express = require('express')
const router = express.Router()

const userRouter = require('./user')

router.use('/user', userRouter)

/* GET home page. */
router.get('/', function (req, res) {
  res.render('index', { title: 'Express' })
})

module.exports = router
