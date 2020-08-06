const { Model, DataTypes } = require('./model')
const mysql = require('mysql2/promise')

module.exports = class WoowaORM {
  constructor({ host, user, password, database }, sync = false) {
    const pool = mysql.createPool({
      host,
      user,
      password,
      database,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    })

    Model.createConnection(pool, sync)
  }
}

module.exports.Model = Model
module.exports.DataTypes = DataTypes
