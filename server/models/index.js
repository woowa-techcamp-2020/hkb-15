const fs = require('fs')
const path = require('path')

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
  const models = getModels()
  models.forEach((model) => model.init())

  if (sync) {
    Promise.all(models.map(async (model) => await model.sync())).then(() => {
      console.log('database synchronized')
    })
  }
}

module.exports = { init }
