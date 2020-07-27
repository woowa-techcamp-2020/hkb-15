const createError = require('http-errors')
const express = require('express')
const path = require('path')
const session = require('express-session')
const logger = require('morgan')
const passport = require('passport')

require('dotenv').config()
require('./models').init()

const router = require('./routes')

const app = express()

// view engine setup
app.set('view engine', 'ejs')
app.engine('html', require('ejs').renderFile)
app.set('views', path.join(__dirname, '../client/dist'))
app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

app.use(express.static(path.join(__dirname, '../client/dist')))
app.use(
  session({
    resave: false,
    saveUninitialized: false,
    secret: process.env.SESSION_SECRET,
  })
)
app.use(passport.initialize())
app.use(passport.session())

app.use('/', router)

// catch 404 and forward to error handler
app.use((req, res, next) => next(createError(404)))

// error handler
app.use((err, req, res) => {
  // set locals, only providing error in development
  console.log(err)
  console.log(err.message)
  res.locals.message = err.message
  res.locals.error = req.app.get('env') === 'development' ? err : {}

  if (err.message.includes('undefined')) err.status = 400

  res.status(err.status || 500)
  res.send(err.message)
})

module.exports = app
