const { Model, DataType } = require('./model')

class Category extends Model {
  static init() {
    return super.init(
      {
        type: { dataType: DataType.varchar, required: true },
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

module.exports = Category
