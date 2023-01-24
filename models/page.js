const { Model, DataTypes } = require("sequelize");
const sequelize = require("./dbconfig");
const Photo = require("./photo");

class Page extends Model {}

Page.init(
  {
    // Model attributes are defined here
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    // Other model options go here
    sequelize, // pass the connection instance
    modelName: "page",
    timestamps: false,
  }
);

Page.hasMany(Photo);
Page.hasMany(Gallery);

module.exports = Page;
