const passport = require('passport')
const GitHubStrategy = require('passport-github').Strategy
const User = require('../models/user')
const createError = require('http-errors')

passport.serializeUser((user, done) => done(null, user.id))
passport.deserializeUser((id, done) =>
  User.findOne('id, username', { id }).then((user) => done(null, user))
)

passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: process.env.GITHUB_CALLBACK_URL,
    },

    function (accessToken, refreshToken, profile, next) {
      User.findOne('*', { username: profile.username }).then(async (user) => {
        return next(
          null,
          user ?? (await User.create({ username: profile.username }))
        )
      })
    }
  )
)

function isAuthenticated(req, res, next) {
  if (req.isAuthenticated()) return next()
  else throw createError(401, 'Auth Error')
}

const authenticate = passport.authenticate('github')

module.exports = { authenticate, isAuthenticated }
