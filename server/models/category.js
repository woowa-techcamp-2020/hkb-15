const { Model, DataTypes } = require('../woowa-orm')

class Category extends Model {
  static init() {
    return super.init(
      {
        type: { dataType: DataTypes.STRING, required: true },
        name: { dataType: DataTypes.STRING, required: true },
        isDeleted: {
          dataType: DataTypes.BOOLEAN,
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
