const fs = require('fs')
const path = require('path')
const WoowaORM = require('woowahan-orm')

function init() {
  WoowaORM(
    {
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    },
    {
      sync: true,
    }
  )

  const models = getModels()
  models.forEach((model) => model.init())
}

function getModels() {
  return fs
    .readdirSync(__dirname)
    .filter((file) => {
      return (
        file.indexOf('.') !== 0 &&
        file !== 'index.js' &&
        file.slice(-3) === '.js'
      )
    })
    .map((file) => require(path.join(__dirname, file)))
}

module.exports = { init }
