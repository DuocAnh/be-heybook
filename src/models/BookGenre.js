import { DataTypes, Model } from 'sequelize'
import sequelize from '~/config/mySQL'

class BookGenre extends Model {}

BookGenre.init(
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

export default BookGenre
