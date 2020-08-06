const createHttpError = require('http-errors')
const mysql = require('mysql2/promise')
const { isEmpty, wrapBacktick } = require('../utils/helper')

const DataType = {
  bool: 'tinyint(1)',
  int: 'int(11)',
  date: 'date',
  datetime: 'datetime',
  timestamp: 'timestamp',
  varchar: 'varchar(255)',
  text: 'text',
}

class Model {
  static pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  })

  static defaultAttributes = {
    id: { dataType: DataType.int },
    createdAt: { dataType: DataType.timestamp },
    updatedAt: { dataType: DataType.timestamp },
  }

  static validationError = createHttpError(400, 'invalid input')

  /**
   * @param {Record<string, { dataType: string, required: boolean, defaultValue: unknown }>} attributes
   */
  static init = function (attributes, { defaultWhere }) {
    this.attributes = attributes
    this.defaultWhere = defaultWhere
  }

  static sync = async function () {
    const createTableQuery = `
    CREATE TABLE IF NOT EXISTS ${wrapBacktick(this.name)} (
      \`id\` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
      ${Object.keys(this.attributes).reduce((strSum, attribute) => {
        const { dataType, required, defaultValue } = this.attributes[attribute]
        return (
          strSum +
          `${wrapBacktick(attribute)} ${dataType} ${
            required ? 'NOT NULL' : 'NULL'
          }${defaultValue ? ` DEFAULT '${defaultValue}'` : ''}, 
          `
        )
      }, '')}

      \`createdAt\` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
      \`updatedAt\` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (\`id\`),
      UNIQUE KEY \`id\` (\`id\`)
    ) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4;`
    console.log(createTableQuery)
    return await this.pool.query(createTableQuery)
  }

  static validate = function (input) {
    const validatedInput = {}
    for (const [name, value] of Object.entries(input)) {
      console.log(name, value)
      if (
        !this.attributes[name] ||
        !this.defaultAttributes[name] ||
        value === undefined
      ) {
        continue
      }
      switch (this.attributes[name].dataType) {
        case DataType.bool:
          if (value == 0 || value == 1) validatedInput[name] = value
          else throw this.validationError
          break
        case DataType.int:
          if (typeof value === 'number' || !isNaN(Number(value))) {
            validatedInput[name] = value
          } else throw this.validationError
          break
        case DataType.datetime:
        case DataType.date:
        case DataType.timestamp:
          if (!isNaN(Date.parse(value))) validatedInput[name] = `'${value}'`
          else throw this.validationError
          break
        case DataType.varchar:
        case DataType.text:
          validatedInput[name] = `'${value}'`
          break
        default:
          throw this.validationError
      }
    }
    return validatedInput
  }

  static generateFindQueryStmt = function ({
    isOne,
    attributes = '*',
    where = {},
    rawWhere,
    sortBy,
  }) {
    const validatedWhere = this.validate({ ...where, ...this.defaultWhere })
    const queryStmt = `
      SELECT ${attributes === '*' ? '*' : wrapBacktick(attributes)} 
      FROM ${this.name}
      ${rawWhere || !isEmpty(validatedWhere) ? `WHERE ` : ''}
      ${
        !isEmpty(validatedWhere)
          ? `${Object.entries(validatedWhere)
              .map((o) => `${o[0]}=${o[1]}`)
              .join(' AND ')}`
          : ''
      } 
      ${!rawWhere || isEmpty(validatedWhere) ? `` : ` AND `}
      ${rawWhere ?? ''}
      ${sortBy ? `ORDER BY ${sortBy.columnName} ${sortBy.order} ` : ''}
      ${isOne ? 'LIMIT 1' : ''}
    `
    return queryStmt
  }

  static generateCreateQueryStmt = function (input) {
    const queryStmt = `
      INSERT INTO ${this.name} (
        ${wrapBacktick(Object.keys(input))} 
        ${!this.attributes.order ? '' : ', `order`'}
      )
      VALUES (
        ${Object.values(input)}
        ${this.attributes.order ? this.generateOrderSubQueryStmt(input) : ''}
      )
    `
    return queryStmt
  }

  static generateUpdateQueryStmt = function (input) {
    const queryStmt = `
      UPDATE ${this.name}
      SET ${Object.entries(input)
        .map((o) => `\`${o[0]}\`=${o[1]}`)
        .join(', ')}
      WHERE id = ${input.id}
    `
    return queryStmt
  }

  static generateDeleteQueryStmt = function (id) {
    const queryStmt = `
      UPDATE ${this.name}
      SET isDeleted = 1
      WHERE id = ${id}
    `
    return queryStmt
  }

  static findOne = async function (params = { attributes: '*' }) {
    const queryStmt = this.generateFindQueryStmt({ ...params, isOne: true })
    return (await this.pool.query(queryStmt))[0][0]
  }

  static findAll = async function (params = { attributes: '*' }) {
    const queryStmt = this.generateFindQueryStmt({ ...params, isOne: false })
    return (await this.pool.query(queryStmt))[0]
  }

  static create = async function (input) {
    const validatedInput = this.validate(input)
    const queryStmt = this.generateCreateQueryStmt(validatedInput)
    return {
      id: (await this.pool.query(queryStmt))[0].insertId,
      ...input,
    }
  }

  static update = async function (input) {
    if (!input.id) throw this.validationError
    const validatedInput = this.validate(input)
    const queryStmt = this.generateUpdateQueryStmt(validatedInput)
    return await this.pool.query(queryStmt)
  }

  static delete = async function (id) {
    if (!id) throw this.validationError
    const queryStmt = this.generateDeleteQueryStmt(id)
    return await this.pool.query(queryStmt)
  }
}

module.exports = { DataType, Model }
