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
      activityId: {
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

  /*
  Gallery.addHook("afterUpdate", async (gallery) => {
    const pg = await gallery.getPage();
    await pg?.deliverActivities();
  });
  */

  SequelizeSlugify.slugifyModel(Gallery, {
    source: ["title"],
  });

  Gallery.prototype.toJSON = function () {
    return {
      id: this.id,
      title: this.title,
      description: this.description,
      slug: this.slug,
      url: this.galleryUrl,
      activity: this.activityId,
      path: this.path,
      pageId: this.PageId,
    };
  };

  Gallery.prototype.createNote = async function () {
    const page = await this.getPage();
    return {
      id: this.activityId,
      type: "Create",
      actor: page.profileUrl,
      published: this.createdAt,
      to: ["https://www.w3.org/ns/activitystreams#Public"],
      cc: [page.followersUrl],
      object: await this.note(),
    };
  };

  Gallery.prototype.note = async function () {
    const page = await this.getPage();
    const photos = await this.getPhotos();
    return {
      id: this.activityId,
      type: "Note",
      published: this.createdAt,
      url: this.galleryUrl,
      attributedTo: page.actorId,
      to: ["https://www.w3.org/ns/activitystreams#Public"],
      cc: [page.followersUrl],
      content: this.description
        ? [this.title, this.description].join("<br />")
        : this.title,
      attachment: photos?.map((p) => p.attachment()),
    };
  };

  return Gallery;
};
