import { URL } from "url";

const base = new URL(process.env.PROTOCOL + process.env.DOMAIN);

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

    this.outboxItems = page.Galleries?.map((gal) => new Activity(gal, this));

    //this.ostatusSubscribe = base.href + "/authorize_interaction?uri={uri}"
    this.acctUri = `acct:${page.slug}@${base.domain}`;
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
    published: this.page.createdOn, // TODO: fix, format "2019-06-01T00:00:00Z",
    // featured
    // following, followers, inbox,
    // manuallyApprovesFollowers: false,
    // devices, publickey
    // icon: { type: "Image", mediaType: "image/jpeg", url: actor.icon, },
    // image: { type: "Image", mediaType: "image/jpeg", url: actor.header, },
  });

  outbox = (paginate, min, max) =>
    paginate
      ? outboxPage(min, max)
      : {
          // or don't paginate, give summary
          "@context": "https://www.w3.org/ns/activitystreams",
          id: this.outboxUrl,
          type: "OrderedCollection",
          totalItems: this.actor.Galleries?.length ?? 0, // TODO: count them
          // TODO: these
          first: this.paginateUrl(this.outboxUrl), // https://domain.example/actor/outbox.json?page=true"
          last: this.paginateUrl(this.outboxUrl, 0), //"https://domain.example/actor/outbox.json?min=0&page=true",
        };

  outboxPage = (min, max) => ({
    ...this.outbox(false), // outbox summary header

    // clobber
    id: this.paginateUrl(this.outboxUrl, { min, max }),
    type: "OrderedCollectionPage",

    //TODO: filter by min/max, calc next/prev
    //next: "", //"https://domain/pagepath.json?max=${nextMax}&page=true",
    //prev: "", //"https://domain/pagepath.json?max=${prevMax}&page=true",
    partOf: this.outboxUrl,
    orderedItems: this.outboxItems?.map((act) => act.create()), // TODO: min/max
  });
}

class Activity {
  constructor(gallery, actor) {
    this.timestampId = gallery.id;
    this.gallery = gallery;
    this.actor = actor ?? new Actor(gallery.Page);

    this.galleryUrl = new URL(gallery.path, base);
    this.activityUrl = new URL(gallery.path + "/activity.json", base);
  }

  toJSON() {
    return this.note();
  }

  create = () => ({
    id: activityUrl,
    type: "Create",
    actor: actorUrl,
    published: this.gallery.createdOn, // TODO: format "2023-02-07T09:26:45Z",
    to: ["https://www.w3.org/ns/activitystreams#Public"],
    cc: [this.actor.followersUrl],
    object: this,
  });

  note = () => ({
    id: this.galleryUrl,
    url: this.galleryUrl,
    content: this.gallery.description,
    type: "note",
    attributedTo: this.actor.actorUrl,
    attachment: this.gallery.Photos?.map(this.attachPhoto),
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
