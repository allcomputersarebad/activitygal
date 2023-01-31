import SequelizeSlugify from "sequelize-slugify";

export default (db, DataTypes) => {
  const Page = db.define("Page", {
    uuid: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, isUUID: 4 },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      notEmpty: true,
    },
    path: {
      type: DataTypes.VIRTUAL,
      get() {
        return `/${this.title}`;
      },
    },
    slug: { type: DataTypes.STRING, unique: true },
  });

  Page.associate = (models) => {
    Page.belongsToMany(models.Photo, { through: "PagePhotos" });
    Page.belongsToMany(models.Gallery, { through: "PageGalleries" });
  };

  SequelizeSlugify.slugifyModel(Page, {
    source: ["title"],
  });

  return Page;
};
