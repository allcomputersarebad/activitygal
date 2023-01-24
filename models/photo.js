const { Model, DataTypes } = require("sequelize");
const sequelize = require("./dbconfig");
const Gallery = require("./gallery");

class Photo extends Model {}

Photo.init(
  {
    // Model attributes are defined here
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
    },
    description: {
      type: DataTypes.TEXT,
    },
    references: {
      model: Gallery,
      key: "id",
    },
  },
  {
    // Other model options go here
    sequelize, // pass the connection instance
    modelName: "photo",
    // timestamps: false,
  }
);

Photo.belongsTo(Gallery); // Photo belongs to Gallery

module.exports = Photo;
