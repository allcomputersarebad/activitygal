import SequelizeSlugify from "sequelize-slugify";
import { URL } from "url";

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

  Page.prototype.actorJson = function (base) {
    const pageUrl = new URL(this.path, base);
    const jsonUrl = new URL(this.path + ".json", base);
    const outboxUrl = new URL(this.path + "/outbox.json", base);
    return {
      "@context": [
        "https://www.w3.org/ns/activitystreams",
        //"https://w3id.org/security/v1", // TODO
      ],
      type: "Person", // masto compat? can it be something else?
      url: pageUrl.href,
      id: jsonUrl.href,
      outbox: outboxUrl.href,
      // endpoints {sharedInbox}
      preferredUsername: this.slug,
      name: this.title,
      summary: this.description,
      published: this.createdOn, // "2019-06-01T00:00:00Z",
      // featured
      // following, followers, inbox,
      // manuallyApprovesFollowers: false,
      // devices, publickey
      // icon: { type: "Image", mediaType: "image/jpeg", url: this.icon, },
      // image: { type: "Image", mediaType: "image/jpeg", url: this.header, },
    };
  };

  Page.prototype.webfingerJson = (base) => {
    const pageUrl = new URL(this.slug, base);
    const activityUrl = new URL(this.slug + ".json", base);
    //const subscribeUrl = new URL("/authorize_interaction?uri={uri}", base);
    return {
      subject: `acct:${this.slug}@${base.domain}`,
      aliases: [pageUrl.href],
      links: [
        {
          rel: "http://webfinger.net/rel/profile-page",
          type: "text/html",
          href: pageUrl.href,
        },
        {
          rel: "self",
          type: "application/activity+json",
          href: activityUrl.href,
        },
        //{ rel: "http://ostatus.org/schema/1.0/subscribe", template: subscribeUrl.href, },
      ],
    };
  };

  SequelizeSlugify.slugifyModel(Page, {
    source: ["title"],
  });

  return Page;
};
