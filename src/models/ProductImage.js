import { DataTypes, Model } from 'sequelize'
import sequelize from '~/config/mySQL'

class ProductImage extends Model {}

ProductImage.init(
  {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.BIGINT
    },
    productId: {
      allowNull: false,
      type: DataTypes.BIGINT
    },
    imageUrl: {
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

export default ProductImage
