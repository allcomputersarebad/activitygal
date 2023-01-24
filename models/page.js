// const { Model, DataTypes } = require("sequelize");
const sequelize = require("./dbconfig");
// const Photo = require("./photo");

// class Page extends Model {}

// Page.init(
//   {
//     // Model attributes are defined here
//     id: {
//       type: DataTypes.INTEGER,
//       primaryKey: true,
//     },
//     name: {
//       type: DataTypes.STRING,
//       allowNull: false,
//     },
//   },
//   {
//     // Other model options go here
//     sequelize, // pass the connection instance
//     modelName: "page",
//     timestamps: false,
//   }
// );

// Page.hasMany(Photo);
// Page.hasMany(Gallery);

// module.exports = Page;

module.exports = (sequelize, DataTypes) => {
  const Page = sequelize.define("page", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  });

  Page.associate = (models) => {
    Page.hasMany(models.Gallery);

    Page.hasMany(models.Photo);
  };

  return Photo;
};
