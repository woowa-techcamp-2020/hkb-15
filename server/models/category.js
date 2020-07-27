const Model = require('./model')

class Category extends Model {
  static init() {
    return super.init(
      {
        id: { dataType: 'int', required: false },
        type: { dataType: 'varchar', required: true },
        name: { dataType: 'varchar', required: true },
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

module.exports = Category
