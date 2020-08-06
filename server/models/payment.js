const { Model, DataTypes } = require('woowahan-orm')

class Payment extends Model {
  static init() {
    return super.init({
      userId: { dataType: DataTypes.INTEGER, required: true },
      name: { dataType: DataTypes.STRING, required: true },
    })
  }
}

module.exports = Payment
