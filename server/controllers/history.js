const History = require('../models/history')

exports.create = async (req, res) => {
  const history = await History.create({ userId: req.user.id, ...req.body })
  res.send(history)
}

exports.findAll = async (req, res) => {
  const histories = await History.findAll('*', {
    userId: req.user.id,
    ...req.query,
  })
  res.send(histories)
}

exports.update = async (req, res) => {
  await History.update(req.body)
  const history = await History.findOne('*', { id: req.body.id })
  res.send(history)
}

exports.delete = async (req, res) => {
  await History.delete(req.params.id)
  res.status(200).send({ completed: true })
}
