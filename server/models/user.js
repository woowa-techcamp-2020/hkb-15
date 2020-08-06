const { Model, DataType } = require('./model')

class User extends Model {
  static init() {
    return super.init(
      {
        username: { dataType: DataType.varchar, required: true },
        isDeleted: { dataType: DataType.bool, defaultValue: '0' },
      },
      {
        defaultWhere: { isDeleted: '0' },
      }
    )
  }
}

module.exports = User
