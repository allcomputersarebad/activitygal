import SequelizeSlugify from "sequelize-slugify";

export default (db, DataTypes) => {
  const Photo = db.define("Photo", {
    title: { type: DataTypes.STRING },
    caption: { type: DataTypes.TEXT },
    description: { type: DataTypes.TEXT },
    altText: {
      type: DataTypes.VIRTUAL,
      get() {
        return `${this.description || this.caption || this.title}`;
      },
    },
    path: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    slug: { type: DataTypes.STRING, unique: true },
  });

  Photo.associate = (models) => {
    Photo.belongsTo(models.Gallery, {
      foreignKey: { allowNull: true },
    });
    Photo.belongsTo(models.Page, {
      foreignKey: { allowNull: true },
    });
  };

  SequelizeSlugify.slugifyModel(Photo, {
    source: ["id", "title"],
    suffixSource: ["gallery"],
  });

  return Photo;
};
