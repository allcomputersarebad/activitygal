import SequelizeSlugify from "sequelize-slugify";

export default (db, DataTypes) => {
  const Page = db.define("Page", {
    paranoid: true,
    id: {
      primaryKey: true,
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      isUUID: 4,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      notEmpty: true,
    },
    path: {
      type: DataTypes.VIRTUAL,
      get() {
        return "/" + this.slug;
      },
    },
    slug: { type: DataTypes.STRING, unique: true },
  });

  Page.associate = (models) => {
    Page.hasMany(models.Gallery);
    Page.belongsToMany(models.RemoteUser, { through: "PageFollowers" });
  };

  SequelizeSlugify.slugifyModel(Page, {
    source: ["title"],
  });

  return Page;
};
