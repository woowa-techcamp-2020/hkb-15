const { Model, DataType } = require('./model')

class History extends Model {
  static init() {
    return super.init(
      {
        userId: { dataType: DataType.int, required: true },
        categoryId: { dataType: DataType.int, required: true },
        paymentId: { dataType: DataType.int, required: true },
        type: { dataType: DataType.varchar, required: true },
        amount: { dataType: DataType.int, required: true },
        content: { dataType: DataType.text, required: true },
        date: { dataType: DataType.date, required: true },
        isDeleted: {
          dataType: DataType.bool,
          defaultValue: '0',
        },
      },
      {
        defaultWhere: { isDeleted: '0' },
      }
    )
  }
  static async findAll({ attributes, where }) {
    const rawWhere = `year(date)=${where.year} AND month(date)=${where.month}`
    return await super.findAll({ attributes, where, rawWhere })
  }
}

module.exports = History
