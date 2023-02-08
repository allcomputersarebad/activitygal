import SequelizeSlugify from "sequelize-slugify";

// TODO: ondelete: emit delete action

export default (db, DataTypes) => {
  const Gallery = db.define("Gallery", {
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
  });

  Gallery.prototype.noteJson = (base) => {
    const galleryUrl = new URL(this.path, base);
    const pageUrl = new URL(this.Page.path, base);
    return {
      content: this.description, // this.gallery.title? pug template?
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
