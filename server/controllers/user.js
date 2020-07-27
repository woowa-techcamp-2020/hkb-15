const bcrypt = require('bcrypt')
const User = require('../models/user')

exports.create = async (req, res) => {
  const input = req.body
  const salt = await bcrypt.genSalt(+process.env.SALTROUNDS)
  input.password = await bcrypt.hash(input.password, salt)
  res.send(await User.create(input))
}

exports.findById = async (req, res) => {
  res.send(req.user)
}
