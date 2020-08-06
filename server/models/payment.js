const { Model, DataType } = require('./model')

class Payment extends Model {
  static init() {
    return super.init(
      {
        userId: { dataType: DataType.int, required: true },
        name: { dataType: DataType.varchar, required: true },
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
}

module.exports = Payment
