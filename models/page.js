import SequelizeSlugify from "sequelize-slugify";

export default (db, DataTypes) => {
  const Page = db.define("Page", {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
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
