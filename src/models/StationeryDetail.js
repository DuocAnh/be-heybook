import { DataTypes, Model } from 'sequelize'
import sequelize from '~/config/mySQL'

class StationeryDetail extends Model {}

StationeryDetail.init(
  {
    productId: {
      allowNull: false,
      primaryKey: true,
      type: DataTypes.BIGINT
    },
    brand: {
      allowNull: false,
      type: DataTypes.STRING
    },
    placeProduction: {
      allowNull: false,
      type: DataTypes.STRING
    },
    color: {
      allowNull: false,
      type: DataTypes.STRING
    },
    material: {
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

export default StationeryDetail
