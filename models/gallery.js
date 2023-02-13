import SequelizeSlugify from "sequelize-slugify";

// TODO: ondelete: emit delete action

export default (db, DataTypes) => {
  const Gallery = db.define(
    "Gallery",
    {
      id: {
        primaryKey: true,
        type: DataTypes.BIGINT,
        defaultValue: () => Date.now() * 10 + Math.floor(Math.random() * 10),
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
        notEmpty: true,
      },
      description: {
        type: DataTypes.TEXT,
      },
      slug: {
        type: DataTypes.STRING,
        unique: true,
      },
      path: {
        type: DataTypes.VIRTUAL(DataTypes.STRING, ["slug"]),
        get() {
          return "/gallery/" + this.slug;
        },
      },
    },
    { paranoid: true }
  );

  Gallery.associate = (models) => {
    Gallery.hasMany(models.Photo);
    Gallery.belongsTo(models.Page);
  };

  SequelizeSlugify.slugifyModel(Gallery, {
    source: ["title"],
  });

  return Gallery;
};
