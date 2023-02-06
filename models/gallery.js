import SequelizeSlugify from "sequelize-slugify";

// TODO: ondelete: emit delete action

export default (db, DataTypes) => {
  const Gallery = db.define("Gallery", {
    paranoid: true,
    id: {
      primaryKey: true,
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
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
  });

  Gallery.noteJson = (base) => {
    const galleryUrl = new URL("/gallery/" + this.slug, base);
    const pageUrl = new URL(this.Page.slug, base);
    return {
      content: this.description, // this.gallery.title?
      path: galleryUrl.href,
      type: "note",
      attributedTo: pageUrl.href,
      attachment: this.Photos.map((p) => p.attachmentJson()),
    };
  };

  Gallery.associate = (models) => {
    Gallery.hasMany(models.Photo);
    Gallery.belongsTo(models.Page);
  };

  SequelizeSlugify.slugifyModel(Gallery, {
    source: ["title"],
  });

  return Gallery;
};
