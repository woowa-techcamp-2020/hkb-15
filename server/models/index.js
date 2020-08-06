const fs = require('fs')
const path = require('path')
const WoowaORM = require('../woowa-orm')

function getModels() {
  return fs
    .readdirSync(__dirname)
    .filter((file) => {
      return (
        file.indexOf('.') !== 0 &&
        file !== 'index.js' &&
        file !== 'model.js' &&
        file.slice(-3) === '.js'
      )
    })
    .map((file) => require(path.join(__dirname, file)))
}

function init({ sync = false }) {
  WoowaORM.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  })

  const models = getModels()
  models.forEach((model) => model.init())

  if (sync) {
    Promise.all(models.map(async (model) => await model.sync())).then(() => {
      console.log('database synchronized')
    })
  }
}

module.exports = { init }
