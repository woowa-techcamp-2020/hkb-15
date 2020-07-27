const fs = require('fs')
const path = require('path')

function init() {
  fs.readdirSync(__dirname)
    .filter((file) => {
      return (
        file.indexOf('.') !== 0 &&
        file !== 'index.js' &&
        file !== 'model.js' &&
        file.slice(-3) === '.js'
      )
    })
    .forEach((file) => require(path.join(__dirname, file)).init())
}

module.exports = { init }
