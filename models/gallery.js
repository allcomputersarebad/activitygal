import SequelizeSlugify from "sequelize-slugify";

export default (db, DataTypes) => {
  const Gallery = db.define("Gallery", {
    uuid: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, isUUID: 4 },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      notEmpty: true,
    },
    description: {
      type: DataTypes.TEXT,
    },
    hidden: {
      type: DataTypes.BOOLEAN,
    },
    path: {
      type: DataTypes.VIRTUAL,
      get() {
        return `/gallery/${this.slug}`;
      },
    },
    slug: {
      type: DataTypes.STRING,
      unique: true,
    },
  });

  Gallery.associate = (models) => {
    Gallery.belongsToMany(models.Photo, { through: "GalleryPhotos" });
    Gallery.belongsToMany(models.Page, { through: "PageGalleries" });
    Gallery.hasOne(models.APNote, { foreignKey: "galleryId" });
  };

  SequelizeSlugify.slugifyModel(Gallery, {
    source: ["title"],
  });

  return Gallery;
};
