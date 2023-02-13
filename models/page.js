import SequelizeSlugify from "sequelize-slugify";

import { URL } from "url";

const base = new URL(
  `${process.env.EXTERNAL_PROTOCOL ?? "http"}://${
    process.env.EXTERNAL_HOST ?? "localhost:3000"
  }`
);

const paginateUrl = (url, min, max) => {
  const p = new URL(url);
  p.searchParams.set("page", "true");
  min !== undefined && p.searchParams.set("min", min);
  max !== undefined && p.searchParams.set("max", max);
  return p;
};

export default (db, DataTypes) => {
  const Page = db.define(
    "Page",
    {
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
      profileUrl: {
        type: DataTypes.VIRTUAL(DataTypes.STRING, ["path"]),
        get() {
          return new URL(this.path, base);
        },
      },
      actorUrl: {
        type: DataTypes.VIRTUAL(DataTypes.STRING, ["path"]),
        get() {
          return new URL(this.path + ".json", base);
        },
      },
      outboxUrl: {
        type: DataTypes.VIRTUAL(DataTypes.STRING, ["path"]),
        get() {
          return new URL(this.path + "/outbox.json", base);
        },
      },
      followersUrl: {
        type: DataTypes.VIRTUAL(DataTypes.STRING, ["path"]),
        get() {
          return new URL(this.path + "/followers", base);
        },
      },
      acctUri: {
        type: DataTypes.VIRTUAL(DataTypes.STRING, ["slug"]),
        get() {
          return `acct:${this.slug}@${base.hostname}`;
        },
      },
    },
    { paranoid: true }
  );

  Page.associate = (models) => {
    Page.hasMany(models.Gallery);
    Page.belongsToMany(models.RemoteUser, { through: "PageFollowers" });
  };

  SequelizeSlugify.slugifyModel(Page, {
    source: ["title"],
  });

  Page.actor = () => ({
    "@context": [
      "https://www.w3.org/ns/activitystreams",
      //"https://w3id.org/security/v1", // TODO
    ],
    type: "Person", // masto compat? can it be something else?
    url: this.profileUrl,
    id: this.actorUrl,
    outbox: this.outboxUrl,
    // endpoints {sharedInbox}
    preferredUsername: this.slug,
    name: this.title,
    summary: this.description,
    published: this.createdAt,
    // featured
    // following
    followers: this.followersUrl,
    // inbox
    // manuallyApprovesFollowers: false,
    // devices, publickey
    // icon: { type: "Image", mediaType: "image/jpeg", url: actor.icon, },
    // image: { type: "Image", mediaType: "image/jpeg", url: actor.header, },
  });

  Page.outbox = (paginate, min, max) => {
    const outboxHeader = {
      "@context": "https://www.w3.org/ns/activitystreams",
      id: this.outboxUrl,
      type: "OrderedCollection",
      totalItems: this.Galleries.length ?? 0,
      first: paginateUrl(this.outboxUrl),
      last: paginateUrl(this.outboxUrl, 0),
    };

    const outboxPage = (min, max) => {
      // TODO: limit number?
      limitedGalleries = this.getGalleries({
        where: { id: { [Sequelize.Op.between]: [min, max] } },
      });
      console.log("page of galleries", limitedGalleries);
      // TODO: grab nextpage min and max from this list?
      return {
        // clobber header items
        id: paginateUrl(this.outboxUrl, min, max),
        type: "OrderedCollectionPage",

        partOf: this.outboxUrl,
        orderedItems: limitedGalleries.map((gal) => gal.createNote()),
        //TODO: calc next/prev better?
        next: new URL(this.outboxUrl).searchParams.set("min", max), //"https://domain/pagepath.json?min=${maxThisPage}&page=true",
        prev: new URL(this.outboxUrl).searchParams.set("max", min), //"https://domain/pagepath.json?max=${minThisPage}&page=true",
      };
    };

    return paginate
      ? { ...outboxHeader, ...outboxPage(min, max) }
      : outboxHeader;
  };

  Page.webfinger = () => ({
    subject: this.acctUri,
    aliases: [this.profileUrl],
    links: [
      {
        rel: "http://webfinger.net/rel/profile-page",
        type: "text/html",
        href: this.profileUrl,
      },
      {
        rel: "self",
        type: "application/activity+json",
        href: this.actorUrl,
      },
      //{ rel: "http://ostatus.org/schema/1.0/subscribe", template: ostatusSubscribe, },
    ],
  });

  return Page;
};
