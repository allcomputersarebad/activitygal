import "dotenv/config";

import SequelizeSlugify from "sequelize-slugify";

import { URL } from "url";
import crypto from "crypto";

const base = new URL(
  `${process.env.EXTERNAL_PROTOCOL ?? "http"}://${
    process.env.EXTERNAL_HOST ?? "localhost:3000"
  }`
);

const testing = Boolean(process.env.NODE_ENV === "test");

const paginateUrl = (url, min, max) => {
  const p = new URL(url);
  p.searchParams.set("page", "true");
  min !== undefined && p.searchParams.set("min", min);
  max !== undefined && p.searchParams.set("max", max);
  return p;
};

export default (db, DataTypes) => {
  let Page = db.define(
    "Page",
    {
      id: {
        primaryKey: true,
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        isUUID: 4,
      },
      publicKey: {
        type: DataTypes.TEXT,
      },
      privateKey: {
        type: DataTypes.TEXT,
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
        notEmpty: true,
      },
      path: {
        type: DataTypes.VIRTUAL(DataTypes.STRING, ["slug"]),
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
      actorId: {
        type: DataTypes.VIRTUAL(DataTypes.STRING, ["path"]),
        get() {
          return new URL(this.path + ".json", base);
        },
      },
      inboxUrl: {
        type: DataTypes.VIRTUAL(DataTypes.STRING, ["path"]),
        get() {
          // same for all pages
          return new URL("/inbox", base);
        },
      },
      outboxUrl: {
        type: DataTypes.VIRTUAL(DataTypes.STRING, ["path"]),
        get() {
          return new URL(this.path + "/outbox", base);
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
    Page.belongsToMany(models.RemoteUser, {
      through: "Followers",
    });
  };
  Page.addHook("beforeCreate", (page) => {
    const { publicKey, privateKey } = testing
      ? {
          publicKey: process.env.TEST_PUBKEY,
          privateKey: process.env.TEST_PRIVKEY,
        }
      : crypto.generateKeyPairSync("rsa", {
          modulusLength: testing ? 1024 : 4096,
          publicKeyEncoding: {
            type: "spki",
            format: "pem",
          },
          privateKeyEncoding: {
            type: "pkcs8",
            format: "pem",
          },
        });
    page.dataValues.publicKey = publicKey;
    page.dataValues.privateKey = privateKey;
  });

  SequelizeSlugify.slugifyModel(Page, {
    source: ["title"],
  });

  Page.prototype.toJSON = function () {
    return {
      id: this.id,
      title: this.title,
      slug: this.slug,
      url: this.profileUrl,
      actor: this.actorId,
      path: this.path,
      //publicKey: this.publicKey,
      // TODO: galleries without async??
      //galleries: gals.map((gal) => gal.toJSON()),
    };
  };

  Page.prototype.actor = function () {
    return {
      "@context": [
        "https://www.w3.org/ns/activitystreams",
        "https://w3id.org/security/v1",
      ],
      type: "Person", // masto compat? can it be something else?
      url: this.profileUrl,
      id: this.actorId,
      outbox: this.outboxUrl,
      //endpoints: {sharedInbox: this.inboxUrl},
      preferredUsername: this.slug,
      name: this.title,
      summary: this.description,
      published: this.createdAt,
      // featured, following
      followers: this.followersUrl,
      inbox: this.inboxUrl,
      manuallyApprovesFollowers: false,
      // devices,
      publicKey: {
        id: this.actorId + "#main-key",
        owner: this.actorId,
        publicKeyPem: this.publicKey,
      },
      // icon: { type: "Image", mediaType: "image/jpeg", url: actor.icon, },
      // image: { type: "Image", mediaType: "image/jpeg", url: actor.header, },
    };
  };

  Page.prototype.outboxPage = async function (min, max) {
    const pageGals = await this.getGalleries({
      // TODO: min/max is broken
      // where: { id: { [db.Sequelize.Op.between]: [min ?? -Infinity, max ?? Infinity] }, },
      limit: 30,
      order: [["id", "DESC"]],
    });
    const createNotes = await Promise.all(
      pageGals?.map((gal) => gal.createNote())
    );
    console.log("page of galleries", pageGals);
    console.log("create notes", createNotes);
    // TODO: min/max is broken
    const maxThisPage = undefined; //await pageGals?.max("id");
    const minThisPage = undefined; //await pageGals?.min("id");

    const pgContent = {
      // these two will clobber header items
      id: paginateUrl(this.outboxUrl, min, max),
      type: "OrderedCollectionPage",

      partOf: this.outboxUrl,
      orderedItems: createNotes,
    };

    //"https://domain/pagepath.json?min=${maxThisPage}&page=true",
    if (maxThisPage !== undefined)
      pgContent.next = paginateUrl(this.outboxUrl, maxThisPage, undefined);
    //"https://domain/pagepath.json?max=${minThisPage}&page=true"
    if (minThisPage !== undefined)
      pgContent.prev = paginateUrl(this.outboxUrl, undefined, minThisPage);

    return pgContent;
  };

  Page.prototype.outbox = async function (paginate, min, max) {
    const itemsCount = await this.countGalleries();
    const header = {
      "@context": [
        "https://www.w3.org/ns/activitystreams",
        "https://w3id.org/security/v1",
      ],
      id: this.outboxUrl,
      type: "OrderedCollection",
      totalItems: itemsCount,
      first: paginateUrl(this.outboxUrl),
      last: paginateUrl(this.outboxUrl, 0),
    };
    const content = await this.outboxPage(min, max);

    return paginate
      ? // outbox with contents
        { ...header, ...content }
      : // or header alone
        header;
  };

  Page.prototype.signActivity = function (activity, remoteInbox) {
    remoteInbox = new URL(remoteInbox);
    const date = new Date().toUTCString();
    const digest = crypto
      .createHash("sha256")
      .update(JSON.stringify(activity))
      .digest("base64");
    const pen = crypto
      .createSign("sha256")
      .update(
        `(request-target): post ${remoteInbox.pathname}\nhost: ${remoteInbox.hostname}\ndate: ${date}\ndigest: SHA-256=${digest}`
      )
      .end();
    const sig = pen.sign(this.privateKey).toString("base64");
    const signature = `keyId="${this.actorId}#main-key",algorithm="rsa-sha256",headers="(request-target) host date digest",signature="${sig}"`;
    return { signature, digest, date };
  };

  Page.prototype.deliverActivities = async function () {
    await this.getRemoteUsers().then(async (followers) => {
      for (const follower of followers) {
        console.log("delivering to follower", follower.actorId);
        await this.getGalleries({
          where: { createdAt: { [db.Sequelize.Op.gt]: follower.lastDelivery } },
        }).then(async (newGals) => {
          for (const gal of newGals) {
            const createActivity = gal.createNote();
            const activitySignature = this.signActivity(
              createActivity,
              follower.inbox
            );
            console.log(
              "signed activity",
              createActivity.id,
              activitySignature
            );
            await follower.deliverActivity(createActivity, activitySignature);
          }
        });
      }
    });
  };

  return Page;
};
