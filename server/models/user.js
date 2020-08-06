const { Model, DataTypes } = require('../woowa-orm')

class User extends Model {
  static init() {
    return super.init(
      {
        username: { dataType: DataTypes.STRING, required: true },
        isDeleted: { dataType: DataTypes.BOOLEAN, defaultValue: '0' },
      },
      {
        defaultWhere: { isDeleted: '0' },
      }
    )
  }
}

module.exports = User
