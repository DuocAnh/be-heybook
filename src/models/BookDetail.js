import { DataTypes, Model } from 'sequelize'
import sequelize from '~/config/mySQL'

class BookDetail extends Model {}

BookDetail.init(
  {
    productId: {
      allowNull: false,
      primaryKey: true,
      type: DataTypes.BIGINT
    },
    bookGenreId: {
      allowNull: false,
      type: DataTypes.BIGINT
    },
    author: {
      allowNull: false,
      type: DataTypes.STRING
    },
    translator: {
      allowNull: false,
      type: DataTypes.STRING
    },
    language: {
      allowNull: false,
      type: DataTypes.STRING
    },
    publisher: {
      allowNull: false,
      type: DataTypes.STRING
    },
    publishYear: {
      allowNull: false,
      type: DataTypes.STRING
    },
    pageCount: {
      allowNull: false,
      type: DataTypes.INTEGER
    }
  },
  {
    timestamps: true,
    sequelize: sequelize,
    underscored: true
  }
)

export default BookDetail
