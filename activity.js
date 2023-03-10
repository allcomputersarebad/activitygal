import { URL } from "url";

const base = new URL(
  `${process.env.EXTERNAL_PROTOCOL ?? "http"}://${
    process.env.EXTERNAL_HOST ?? "localhost:3000"
  }`
);

function webfinger(actor) {
  return {
    subject: actor.acctUri,
    aliases: [actor.profileUrl],
    links: [
      {
        rel: "http://webfinger.net/rel/profile-page",
        type: "text/html",
        href: actor.profileUrl,
      },
      {
        rel: "self",
        type: "application/activity+json",
        href: actor.actorUrl,
      },
      //{ rel: "http://ostatus.org/schema/1.0/subscribe", template: ostatusSubscribe, },
    ],
  };
}

class Actor {
  constructor(page) {
    this.page = page;

    this.profileUrl = new URL(page.path, base);
    this.actorUrl = new URL(page.path + ".json", base);
    this.outboxUrl = new URL(page.path + "/outbox.json", base);
    this.followersUrl = new URL(page.path + "/followers", base);

    // TODO: query this more deliberately. getGalleries? in outbox?
    this.outboxItems = page.Galleries?.map((gal) => new Activity(gal, this));

    //this.ostatusSubscribe = base.href + "/authorize_interaction?uri={uri}"
    this.acctUri = `acct:${page.slug}@${base.hostname}`;
  }

  toJSON() {
    return this.actor();
  }

  paginateUrl = (url, min, max) => {
    const p = new URL(url);
    p.searchParams.set("page", "true");
    min !== undefined && p.searchParams.set("min", min);
    max !== undefined && p.searchParams.set("max", max);
    return p;
  };

  actor = () => ({
    "@context": [
      "https://www.w3.org/ns/activitystreams",
      //"https://w3id.org/security/v1", // TODO
    ],
    type: "Person", // masto compat? can it be something else?
    url: this.profileUrl,
    id: this.actorUrl,
    outbox: this.outboxUrl,
    // endpoints {sharedInbox}
    preferredUsername: this.page.slug,
    name: this.page.title,
    summary: this.page.description,
    published: this.page.createdAt,
    // featured
    // following
    followers: this.followersUrl,
    // inbox
    // manuallyApprovesFollowers: false,
    // devices, publickey
    // icon: { type: "Image", mediaType: "image/jpeg", url: actor.icon, },
    // image: { type: "Image", mediaType: "image/jpeg", url: actor.header, },
  });

  outbox = (paginate, min, max) =>
    paginate // TODO: handle weird paginate values
      ? this.outboxPage(min, max)
      : {
          "@context": "https://www.w3.org/ns/activitystreams",
          id: this.outboxUrl,
          type: "OrderedCollection",
          totalItems: this.outboxItems.length ?? 0,
          first: this.paginateUrl(this.outboxUrl),
          last: this.paginateUrl(this.outboxUrl, 0),
        };

  outboxPage = (min, max) => ({
    ...this.outbox(false), // outbox summary header

    // clobber
    id: this.paginateUrl(this.outboxUrl, min, max),
    type: "OrderedCollectionPage",

    //TODO: calc next/prev
    //next: "", //"https://domain/pagepath.json?max=${nextMax}&page=true",
    //prev: "", //"https://domain/pagepath.json?max=${prevMax}&page=true",
    partOf: this.outboxUrl,
    // TODO: refine this
    orderedItems: this.outboxItems
      ?.filter(
        ({ timestampId }) =>
          (min ?? 0) <= timestampId && timestampId <= (max ?? Infinity)
      )
      ?.map((act) => act.create()),
  });
}

class Activity {
  constructor(gallery, actor) {
    this.timestampId = gallery.id;
    this.gallery = gallery;
    this.actor = actor;

    this.galleryUrl = new URL(gallery.path, base);
    this.activityUrl = new URL(gallery.path + ".json", base);

    // TODO: pug template?
    this.noteContent = [gallery.title, gallery.description].join("<br />");
  }

  toJSON() {
    return this.note();
  }

  create = () => ({
    id: this.activityUrl,
    type: "Create",
    actor: this.actor.profileUrl,
    published: this.gallery.createdAt,
    to: ["https://www.w3.org/ns/activitystreams#Public"],
    cc: [this.actor.followersUrl],
    object: this,
  });

  note = () => ({
    id: this.galleryUrl,
    type: "note",
    published: this.gallery.createdAt,
    url: this.galleryUrl,
    attributedTo: this.actor.actorUrl,
    to: ["https://www.w3.org/ns/activitystreams#Public"],
    cc: [this.actor.followersUrl],
    content: this.noteContent,
    attachment: this.gallery.Photos?.map((p) => this.attachPhoto(p)),
  });

  attachPhoto = (photo) => ({
    type: "Document",
    mediaType: photo.mediaType, // like "image/png",
    url: new URL(photo.path, base),
    name: photo.altText,
    //"focalPoint": [ 0.6, 1.0 ], // unnecessary
    //width, height // necessary?
  });
}

export { Actor, Activity, webfinger };
