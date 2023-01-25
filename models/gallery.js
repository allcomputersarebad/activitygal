import SequelizeSlugify from "sequelize-slugify";

export default (db, DataTypes) => {
  const Gallery = db.define("Gallery", {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
    },
    slug: {
      type: DataTypes.STRING,
      unique: true,
    },
  });

  Gallery.associate = (models) => {
    Gallery.hasMany(models.Photo);
  };

  SequelizeSlugify.slugifyModel(Gallery, {
    source: ["name"],
  });

  return Gallery;
};
