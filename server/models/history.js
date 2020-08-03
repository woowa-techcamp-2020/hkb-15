const Model = require('./model')

class History extends Model {
  static init() {
    return super.init(
      {
        id: { dataType: 'int', required: false },
        userId: { dataType: 'int', required: true },
        categoryId: { dataType: 'int', required: true },
        paymentId: { dataType: 'int', required: true },
        type: { dataType: 'varchar', required: true },
        amount: { dataType: 'int', required: true },
        content: { dataType: 'text', required: true },
        date: { dataType: 'datetime', required: true },
        isDeleted: { dataType: 'tinyint', required: false },
        createdAt: { dataType: 'datetime', required: false },
        updatedAt: { dataType: 'datetime', required: false },
      },
      {
        defaultWhere: { isDeleted: 0 },
      }
    )
  }
  static async findAll(attributes, where) {
    const rawWhere = `year(date)=${where.year} AND month(date)=${where.month}`
    return await super.findAll(attributes, where, rawWhere)
  }
}

module.exports = History
