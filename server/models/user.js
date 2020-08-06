const { Model, DataTypes } = require('woowahan-orm')

class User extends Model {
  static init() {
    return super.init({
      username: { dataType: DataTypes.STRING, required: true },
    })
  }
}

module.exports = User
