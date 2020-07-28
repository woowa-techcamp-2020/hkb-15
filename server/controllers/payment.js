const Payment = require('../models/payment')

exports.create = async (req, res) => {
  const payment = await Payment.create({ userId: 1, ...req.body })
  res.send(payment)
}

exports.update = async (req, res) => {
  await Payment.update(req.body)
  res.status(200).send({ completed: true })
}

exports.delete = async (req, res) => {
  await Payment.delete(req.params.id)
  res.status(200).send({ completed: true })
}