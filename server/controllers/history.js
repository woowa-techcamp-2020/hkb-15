const History = require('../models/history')

exports.create = async (req, res) => {
  const history = await History.create({ userId: 1, ...req.body })
  res.send(history)
}

exports.findAll = async (req, res) => {
  const histories = await History.findAll('*', req.query)
  res.send(histories)
}

exports.update = async (req, res) => {
  await History.update(req.body)
  res.status(200).send({ completed: true })
}

exports.delete = async (req, res) => {
  await History.delete(req.params.id)
  res.status(200).send({ completed: true })
}
