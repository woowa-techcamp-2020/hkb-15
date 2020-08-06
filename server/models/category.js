const { Model, DataTypes } = require('woowahan-orm')

class Category extends Model {
  static init() {
    return super.init({
      type: { dataType: DataTypes.STRING, required: true },
      name: { dataType: DataTypes.STRING, required: true },
    })
  }
}

module.exports = Category
