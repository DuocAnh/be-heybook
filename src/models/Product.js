import { DataTypes, Model } from 'sequelize'
import sequelize from '~/config/mySQL'

class Product extends Model {
  toJSON() {
    const attributes = { ...this.get() }
    if (!attributes.bookDetail) delete attributes.bookDetail
    if (!attributes.stationeryDetail) delete attributes.stationeryDetail
    return attributes
  }
}

Product.init(
  {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.BIGINT
    },
    categoryId: {
      allowNull: false,
      type: DataTypes.BIGINT
    },
    name: {
      allowNull: false,
      type: DataTypes.STRING
    },
    price: {
      allowNull: false,
      type: DataTypes.DECIMAL
    },
    discount: {
      allowNull: false,
      type: DataTypes.DECIMAL
    },
    stock: {
      allowNull: false,
      type: DataTypes.INTEGER
    },
    description: {
      allowNull: false,
      type: DataTypes.STRING
    },
    coverImageUrl: {
      allowNull: false,
      type: DataTypes.STRING
    },
    dimension: {
      allowNull: true,
      type: DataTypes.STRING
    },
    type: {
      allowNull: false,
      type: DataTypes.ENUM('BOOK', 'STATIONERY'),
      primaryKey: true
    }
  },
  {
    timestamps: true,
    sequelize,
    underscored: true
  }
)

export default Product
