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
    resource: {
      type: DataTypes.STRING,
      notEmpty: true,
      allowNull: false,
    },
    path: {
      type: DataTypes.VIRTUAL,
      get() {
        return `/photo/${this.resource}`;
      },
    },
    slug: {
      type: DataTypes.STRING,
      unique: true,
    },
  });

  SequelizeSlugify.slugifyModel(Photo, {
    source: ["title"],
  });

  Photo.associate = (models) => {
    Photo.belongsToMany(models.Gallery, { through: "GalleryPhotos" });
    Photo.belongsToMany(models.Page, { through: "PagePhotos" });
  };

  return Photo;
};
