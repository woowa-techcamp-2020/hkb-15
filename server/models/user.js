const Model = require('./model')

class User extends Model {
  static init() {
    return super.init(
      {
        id: { dataType: 'int', required: false },
        username: { dataType: 'varchar', required: true },
        isDeleted: { dataType: 'tinyint', required: false },
        createdAt: { dataType: 'datetime', required: false },
        updatedAt: { dataType: 'datetime', required: false },
      },
      {
        defaultWhere: { isDeleted: 0 },
      }
    )
  }
}

module.exports = User
