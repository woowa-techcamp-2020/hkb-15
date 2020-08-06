const Payment = require('../models/payment')

exports.create = async (req, res) => {
  const payment = await Payment.create({ userId: req.user.id, ...req.body })
  res.send(payment)
}

exports.findAll = async (req, res) => {
  const payments = await Payment.findAll('*', { userId: req.user.id })
  res.send(payments)
}

exports.update = async (req, res) => {
  await Payment.update(req.body)
  res.status(200).send({ completed: true })
}

exports.delete = async (req, res) => {
  await Payment.delete(req.params.id)
  res.status(200).send({ completed: true })
}
