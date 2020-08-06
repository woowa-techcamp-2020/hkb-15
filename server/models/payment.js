const { Model, DataTypes } = require('woowahan-orm')

class Payment extends Model {
  static init() {
    return super.init(
      {
        userId: { dataType: DataTypes.INTEGER, required: true },
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

module.exports = Payment
