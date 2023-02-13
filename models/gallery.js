import SequelizeSlugify from "sequelize-slugify";

import { URL } from "url";

const base = new URL(
  `${process.env.EXTERNAL_PROTOCOL ?? "http"}://${
    process.env.EXTERNAL_HOST ?? "localhost:3000"
  }`
);

// TODO: ondelete: emit delete activity

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
      galleryUrl: {
        type: DataTypes.VIRTUAL(DataTypes.STRING, ["path"]),
        get() {
          return new URL(this.path, base);
        },
      },
      activityUrl: {
        type: DataTypes.VIRTUAL(DataTypes.STRING, ["path"]),
        get() {
          return new URL(this.path + ".json", base);
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

  Gallery.createNote = () => ({
    id: this.activityUrl,
    type: "Create",
    actor: this.Page.profileUrl,
    published: this.createdAt,
    to: ["https://www.w3.org/ns/activitystreams#Public"],
    cc: [this.Page.followersUrl],
    object: this.note(),
  });

  Gallery.note = () => ({
    id: this.galleryUrl,
    type: "note",
    published: this.createdAt,
    url: this.galleryUrl,
    attributedTo: this.Page.actorUrl,
    to: ["https://www.w3.org/ns/activitystreams#Public"],
    cc: [this.Page.followersUrl],
    content: this.description
      ? [this.title, this.description].join("<br />")
      : this.title,
    attachment: this.Photos?.map((p) => p.attachment()) || [],
  });

  return Gallery;
};
