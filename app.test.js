import "dotenv/config";

import { URL } from "url";
const request = require("supertest");

const fs = require("fs");
const path = require("path");

const app = require("./app").default;

let baseUrl, hostName;

const db = require("./models").default;

/* TODO
 * - test more page rendering
 * - clear db between tests
 * - create database seeds instead of requesting all the time
 * - do more photo tests
 */

const auth = ["admin", process.env.PHOTO_ADMIN];

const mockPhotoPath = "mock_data";
const mockPageGalleryAssoc = [1, 3, 3, 4, 4];

const mockGalleries = [
  {
    title: "Demo Gal",
    description: "A gallery demonstration",
  },
  {
    title: "Another Demo",
    description: "Another gallery demonstration",
  },
  {
    title: "Even More Demo",
    description: "Even more demonstration",
  },
  {
    title: "Hidden Demo",
    description: "Hidden gallery demonstration",
    hidden: true,
  },
  {
    title: "Empty Demo",
    description: "Empty gallery demonstration",
  },
  {
    title: "Additional Demo",
    description: "Additional gallery demonstration",
  },
  {
    title: "Aweghghghewa",
    description: "So extra",
  },
  {
    title: "Still need more",
    description: "And more description",
  },
];

const mockPages = [
  {
    title: "Demo Page",
    description: "A page demonstration",
  },
  {
    title: "A Single Page",
    description: "Page with a single gal",
  },
  {
    title: "Empty Page",
    description: "Empty page demonstration",
  },
  {
    title: "Additional Page",
    description: "Additional page demonstration",
  },
  {
    title: "Hidden Page",
    description: "Hidden page demonstration",
    hidden: true,
  },
];

const mockPhotos = [
  {
    title: "Demo Photo",
    description: "This photo demonstrates photos",
    caption: "This is a photo caption",
  },
  {
    title: "Another Another Demo Photo",
    description: "This is another another photo demonstrating photos",
    caption: "This is another another photo caption",
  },
  {
    title: "Another Demo Photo",
    description: "This is another photo demonstrating photos",
    caption: "This is another photo caption",
  },
  {
    title: "Even More Demo Photo",
    description: "This is even more photo demonstrating photos",
    caption: "This is even more photo caption",
  },
  {
    title: "Hidden Demo Photo",
    description: "This demonstrates a hidden photo",
    caption: "This is a caption on a hidden photo",
    hidden: true,
  },
  {
    title: "Additional Demo Photo",
    description: "This demonstrates an additional photo",
    caption: "This is a caption on an additional photo",
  },
  {
    title: "Aweghghghewaawgfwagweg",
    description: "This demonstrates an additional photo",
    caption: "This is a caption on an additional photo",
  },
  {
    title: "Still need more",
    description: "And more description",
    caption: "And more caption",
  },
];

const mockPhotoRefs = Object.fromEntries(
  fs.readdirSync(mockPhotoPath).map((dir) => [
    dir, // nested gallery dir name
    fs // scan nested dir for gallery photos
      .readdirSync(path.resolve(mockPhotoPath, dir))
      .filter((file) => path.extname(file) === ".jpg")
      .map((leaf) => path.resolve(mockPhotoPath, dir, leaf)),
  ])
);

const postMockPages = async () => {
  const testPages = Array();
  for (let pg of mockPages) {
    const pgResult = await request(baseUrl)
      .post("/admin/page")
      .accept("json")
      .auth(...auth)
      .type("form")
      .send(pg);
    testPages.push(pgResult?.body);
  }
  return testPages;
};

const postMockGalleries = async (testPages, pageAssoc) => {
  pageAssoc = pageAssoc ?? mockPageGalleryAssoc;
  const testGalleries = Array();
  for (let [i, gal] of mockGalleries.entries()) {
    const pageId = testPages[pageAssoc[i] ?? 0]?.id;
    console.log("associating gallery with page", pageId);
    const sendGal = { ...gal, pageId };
    const galResult = await request(baseUrl)
      .post("/admin/gallery")
      .accept("json")
      .auth(...auth)
      .type("form")
      .send(sendGal);
    testGalleries.push(galResult?.body);
  }
  return testGalleries;
};

const postMockPhotos = async (gallery, photos) => {
  const photosRequest = request(baseUrl)
    .post("/admin/photo")
    .accept("json")
    .type("form")
    .auth(...auth)
    .field("target", gallery);
  photos.forEach((photo) => photosRequest.attach("photos", photo));
  return (await photosRequest)?.body;
};

let server;

beforeAll(function (done) {
  db.sequelize.sync().then(() => {
    server = app.listen(process.env.PORT ?? 3000, () => {
      baseUrl = app.get("baseUrl");
      hostName = app.get("publicHost") || "localhost";
      done();
    });
  });
});

afterAll(function (done) {
  server.close(done);
});

describe("create pages and galleries", () => {
  it("can create several pages", async () => {
    const testPages = await postMockPages();
    console.log("testPages", testPages);
    expect(testPages.length).toBe(mockPages.length);
  });
  it("can create several galleries associated with pages", async () => {
    const testPages = await postMockPages();
    console.log("testPages", testPages);
    const testGalleries = await postMockGalleries(testPages);
    console.log("testGalleries", testGalleries);
    expect(testGalleries.length).toBe(mockGalleries.length);
    expect(testGalleries[0]?.pageId).toBe(testPages[1]?.id);
  });
  it("can create several photos associated with a gallery", async () => {
    const testPages = await postMockPages();
    const testGalleries = await postMockGalleries(testPages);
    const testPhotos = await postMockPhotos(
      testGalleries[1]?.id,
      mockPhotoRefs.blue
    );
    expect(testPhotos.length).toBe(mockPhotoRefs.blue.length);
  });
});

describe("get routes", () => {
  let testGalleries;
  let testPages;
  let testPhotos;
  beforeAll(async () => {
    testPages = await postMockPages();
    console.log("testPages", testPages);
    testGalleries = await postMockGalleries(testPages);
    console.log("testGalleries", testGalleries);
    testPhotos = await postMockPhotos(testGalleries[1]?.id, mockPhotoRefs.blue);
    console.log("testPhotos", testPhotos);
  });

  describe("page gets", () => {
    it("can get one page", async () => {
      const response = await request(baseUrl).get(testPages[0].path);
      expect(response.status).toBe(200);
    });
    it("can get all pages with auth", async () => {
      const response = await request(baseUrl)
        .get("/admin/page")
        .auth(auth.user, auth.pass);
      expect(Array.isArray(response.body));
    });
  });

  describe("gallery gets", () => {
    it("can get one gallery", async () => {
      const response = await request(baseUrl).get(testGalleries[0].path);
      expect(response.status).toBe(200);
    });
    it("can get all galleries with auth", async () => {
      const response = await request(baseUrl)
        .get("/admin/gallery")
        .auth(auth.user, auth.pass);
      expect(Array.isArray(response.body));
    });
  });

  describe("photo gets", () => {
    it("can get one photo", async () => {
      const response = await request(baseUrl).get(testPhotos[0].path);
      expect(response.status).toBe(200);
    });
    it("can get all photos with auth", async () => {
      const response = await request(baseUrl)
        .get("/admin/photo")
        .auth(auth.user, auth.pass);
      expect(Array.isArray(response.body));
    });
  });
});

describe("activitypub routes", () => {
  let testPages, testGalleries, testPhotos;
  beforeAll(async () => {
    testPages = await postMockPages();
    testGalleries = await postMockGalleries(testPages);
    testPhotos = [
      await postMockPhotos(testGalleries[5]?.id, mockPhotoRefs.red),
      await postMockPhotos(testGalleries[6]?.id, mockPhotoRefs.green),
      await postMockPhotos(testGalleries[7]?.id, mockPhotoRefs.blue),
    ];
  });
  it("can webfinger a page", async () => {
    const response = await request(baseUrl)
      .get("/.well-known/webfinger")
      .query({
        resource: `acct:${testPages[0].slug}@${hostName}`,
      });
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("subject");
    expect(response.body.subject).toBe(`acct:${testPages[0].slug}@${hostName}`);
  });
  it("can get page actor", async () => {
    const pageUrl = new URL(testPages[1].slug, baseUrl);
    const actorUrl = new URL(testPages[1].slug + ".json", baseUrl);
    const outboxUrl = new URL(testPages[1].slug + "/outbox", baseUrl);
    const response = await request(baseUrl).get(actorUrl.pathname);
    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      "@context": [
        "https://www.w3.org/ns/activitystreams",
        "https://w3id.org/security/v1",
      ],
      id: actorUrl.href,
      name: testPages[1].title,
      outbox: outboxUrl.href,
      preferredUsername: testPages[1].slug,
      type: "Person",
      url: pageUrl.href,
    });
  });
  it("can get outbox summary", async () => {
    const outboxUrl = new URL(testPages[0].slug + "/outbox", baseUrl);
    const response = await request(baseUrl).get(outboxUrl.pathname);
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("totalItems");
    expect(response.body).toMatchObject({
      "@context": [
        "https://www.w3.org/ns/activitystreams",
        "https://w3id.org/security/v1",
      ],
      id: outboxUrl.href,
      type: "OrderedCollection",
      first: outboxUrl.href + "?page=true",
      last: outboxUrl.href + "?page=true&min=0",
    });
  });
  it("can paginate outbox", async () => {
    const outboxUrl = new URL(testPages[0].slug + "/outbox", baseUrl);
    const response = await request(baseUrl).get(outboxUrl.pathname).query({
      page: true,
    });
    expect(response.status).toBe(200);
    expect(response.type).toBe("application/activity+json");
    expect(response.body).toHaveProperty("totalItems");
    expect(response.body).toHaveProperty("orderedItems");
    expect(response.body).toMatchObject({
      "@context": [
        "https://www.w3.org/ns/activitystreams",
        "https://w3id.org/security/v1",
      ],
      id: outboxUrl.href + "?page=true",
      type: "OrderedCollectionPage",
      partOf: outboxUrl.href,
    });
  });
});
