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
      sync: process.env.ISDEMO,
    }
  )

  const models = getModels()
  models.forEach((model) => model.init())

  if (process.env.ISDEMO) dumpDemoData()
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

function dumpDemoData() {
  setTimeout(() => {
    const querieStmts = fs
      .readFileSync(__dirname + '/../demo-data.sql', 'utf8')
      .split(';')

    Promise.all(
      querieStmts.map(async (queryStmt) => {
        if (!queryStmt) return
        return await WoowaORM.Model.pool.query(queryStmt)
      })
    ).then(() => {
      console.log('Demo Data added')
    })
  }, 1000)
}

module.exports = { init }
