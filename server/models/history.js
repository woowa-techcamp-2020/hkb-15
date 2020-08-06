const { Model, DataTypes } = require('woowahan-orm')

class History extends Model {
  static init() {
    return super.init({
      userId: { dataType: DataTypes.INTEGER, required: true },
      categoryId: { dataType: DataTypes.INTEGER, required: true },
      paymentId: { dataType: DataTypes.INTEGER, required: true },
      type: { dataType: DataTypes.STRING, required: true },
      amount: { dataType: DataTypes.INTEGER, required: true },
      content: { dataType: DataTypes.TEXT, required: true },
      date: { dataType: DataTypes.DATE, required: true },
    })
  }
  static async findAll({ attributes, where }) {
    const rawWhere = `year(date)=${where.year} AND month(date)=${where.month}`
    return await super.findAll({ attributes, where, rawWhere })
  }
}

module.exports = History
