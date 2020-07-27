const passport = require('passport')
const bcrypt = require('bcrypt')
const LocalStrategy = require('passport-local').Strategy
const User = require('../models/user')
const createHttpError = require('http-errors')

passport.serializeUser(async (user, done) => done(null, user.id))
passport.deserializeUser(async (id, done) =>
  done(null, await User.findOne('id, username, nickname', { id }))
)

passport.use(
  new LocalStrategy((username, password, done) => {
    User.findOne('id, username, nickname, password', { username }).then(
      (user) => {
        if (!user) return done(null, false)
        return bcrypt.compare(password, user.password, (err, res) => {
          if (res) return done(null, user)
          return done(null, false)
        })
      }
    )
  })
)

function isAuthenticated(req, res, next) {
  if (req.isAuthenticated()) return next()
  else throw createHttpError(401, 'Auth Error')
}

const authenticate = () => passport.authenticate('local')

module.exports = { authenticate, isAuthenticated }
