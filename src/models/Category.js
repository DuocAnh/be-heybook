import { DataTypes, Model } from 'sequelize'
import sequelize from '~/config/mySQL'

class Category extends Model {
  // static associate(models) {
  //   this.hasMany(models.Product, {
  //     foreignKey: 'categoryId',
  //     as: 'products',
  //     onUpdate: 'CASCADE'
  //   })
  // }
}

Category.init(
  {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.BIGINT
    },
    name: {
      allowNull: false,
      type: DataTypes.STRING
    }
  },
  {
    timestamps: true,
    sequelize: sequelize,
    underscored: true
  }
)

export default Category
