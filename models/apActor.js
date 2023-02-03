export default (db, DataTypes) => {
  const APActor = db.define("APActor", {
    paranoid: true,
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, isUUID: 4 },
    fullPath: {
      type: DataTypes.VIRTUAL,
      get() {
        return `${domain}/${this.photo.slug}`;
      },
    },
    actorPath: {
      type: DataTypes.VIRTUAL,
      get() {
        return `${this.fullPath}.json`;
      },
    },
    outbox: {
      type: DataTypes.VIRTUAL,
      get() {
        return `${this.fullPath}/outbox.json`;
      },
    },
    icon: {
      type: DataTypes.VIRTUAL,
      get() {
        return `${this.page.icon}`;
      },
    },
    header: {
      type: DataTypes.VIRTUAL,
      get() {
        return `${this.page.header}`;
      },
    },
  });

  APActor.jsonLD = () => ({
    "@context": [
      "https://www.w3.org/ns/activitystreams", // TODO
      //"https://w3id.org/security/v1",
    ],
    id: this.actorPath,
    type: "Person", // masto compat. "Photo Timeline" or something else?
    // following, followers, inbox,
    outbox: this.outbox,
    // featured
    preferredUsername: page.slug,
    name: page.title,
    summary: page.description,
    url: this.fullPath, // human legible
    // manuallyApprovesFollowers: false,
    published: page.createdOn, // "2019-06-01T00:00:00Z",
    // devices
    // publickey
    // endpoints {sharedInbox}
    icon: {
      type: "Image",
      mediaType: "image/jpeg",
      url: this.icon,
    },
    image: {
      type: "Image",
      mediaType: "image/jpeg",
      url: this.header,
    },
  });

  APActor.webfinger = () => ({
    // https://domain/.well-known/webfinger?resource=acct:pageslug@domain
    subject: "acct:" + page.slug + "@" + domain,
    aliases: [page.url],
    links: [
      {
        rel: "http://webfinger.net/rel/profile-page",
        type: "text/html",
        href: page.fullPath,
      },
      {
        rel: "self",
        type: "application/activity+json",
        href: page.fullPath + ".json",
      },
      {
        rel: "http://ostatus.org/schema/1.0/subscribe",
        template: "https://domain/authorize_interaction?uri={uri}", // TODO
      },
    ],
  });

  APActor.outbox = (page, { min, max }) =>
    page
      ? this.outboxPage(min, max)
      : {
          "@context": "https://www.w3.org/ns/activitystreams",
          id: page.fullPath + "/outbox.json",
          type: "OrderedCollection",
          totalItems: 0, // TODO: count them
          first: "https://domain/fullPath/outbox.json?page=true",
          last: "https://domain/fullPath/outbox.json?min=0&page=true",
        };

  APActor.outboxPage = (min, max) => ({
    ...this.outbox(false),
    id: page.fullPath + ".json?page=true", // max or min?
    type: "OrderedCollectionPage",
    next: "", //"https://domain/pagepath.json?max=${nextMax}&page=true",
    prev: "", //"https://domain/pagepath.json?max=${prevMax}&page=true",
    partOf: page.fullPath + ".json",
    orderedItems: [this.APNotes.map((note) => note.doCreate())], // should these be already generated, in an outbox field?
  });

  APActor.associate = (models) => {
    APActor.belongsTo(models.Page, { foreignKey: "pageId" });
    APActor.hasMany(models.APNote, { foreignKey: "actorId" });
    APActor.hasMany(models.APAttachment, { foreignKey: "actorId" });
  };

  return APActor;
};
