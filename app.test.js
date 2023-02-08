const request = require("supertest");
const baseURL = "http://localhost:3000";
const mockPhotoPath = "mock_data";
const fs = require("fs");
const path = require("path");

const app = require("./app").default;
const db = require("./models").default;

const auth = ["admin", process.env.PHOTO_ADMIN];

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
    const pgResult = await request(baseURL)
      .post("/admin/page")
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
    const PageId = testPages[pageAssoc[i] ?? 0]?.id;
    const sendGal = { ...gal, PageId };
    const galResult = await request(baseURL)
      .post("/admin/gallery")
      .auth(...auth)
      .type("form")
      .send(sendGal);
    testGalleries.push(galResult?.body);
  }
  return testGalleries;
};

const postMockPhotos = async (gallery, ...photos) => {
  const photosUp = await request(baseURL)
    .post("/admin/photo")
    .type("form")
    .auth(...auth)
    .field("target", gallery)
    .attach("photos", ...photos);
  return photosUp;
};

let server;

beforeAll(function (done) {
  db.sequelize.sync().then(() => {
    server = app.listen("3000", done);
  });
});

afterAll(function (done) {
  server.close(done);
});

describe("create pages and galleries", () => {
  it("can create several pages", async () => {
    const testPages = await postMockPages();
    expect(testPages.length).toBe(mockPages.length);
  });
  it("can create several galleries associated with pages", async () => {
    const testPages = await postMockPages();
    const testGalleries = await postMockGalleries(testPages);
    expect(testGalleries.length).toBe(mockGalleries.length);
  });
});

describe("get routes", () => {
  let testGalleries;
  let testPages;
  beforeAll(async () => {
    // TODO: env for all of this instead of using routes
    testPages = await postMockPages();
    testGalleries = await postMockGalleries(testPages);
    /*
    const photos = await createMockPhotos(
      testGalleries[1]?.id,
      ...mockPhotoRefs.blue
    );
    */
  });

  describe("page gets", () => {
    it("can get one page", async () => {
      const response = await request(baseURL).get(testPages[0].path);
      expect(response.status).toBe(200);
    });
    it("can get all pages with auth", async () => {
      const response = await request(baseURL)
        .get("/admin/page")
        .auth(auth.user, auth.pass);
      expect(Array.isArray(response.body));
    });
  });

  describe("gallery gets", () => {
    it("can get one gallery", async () => {
      const response = await request(baseURL).get(testGalleries[0].path);
      expect(response.status).toBe(200);
    });
    it("can get all galleries with auth", async () => {
      const response = await request(baseURL)
        .get("/admin/gallery")
        .auth(auth.user, auth.pass);
      expect(Array.isArray(response.body));
    });
  });

  describe("photo gets", () => {
    /*
    it("can get one photo", async () => {
      expect(response.status).toBe(200);
    });
    */
    it("can get all photos with auth", async () => {
      const response = await request(baseURL)
        .get("/admin/photo")
        .auth(auth.user, auth.pass);
      expect(Array.isArray(response.body));
    });
  });
});

describe("photo creation", () => {
  let testGalleries;
  let testPages;
  beforeAll(async () => {
    testPages = await postMockPages();
    testGalleries = await postMockGalleries(testPages);
  });
  // create galleries and pages
  it("can post a single photo to a gallery", async () => {
    const response = await postMockPhotos(
      testGalleries[0]?.id,
      mockPhotoRefs.red[0]
    );
    expect(response.status).toBe(302);
    expect(response.header.location).toBe(testGalleries[0].path);
    const redir = await request(baseURL).get(response.header.location);
    expect(redir.status).toBe(200);
    expect(redir.text).toContain(testGalleries[0].title);
  });
  it("can post multiple photos to a gallery", async () => {
    const response = await postMockPhotos(
      testGalleries[1]?.id,
      ...mockPhotoRefs.blue
    );
    expect(response.status).toBe(302);
    expect(response.header.location).toBe(testGalleries[1].path);
    const redir = await request(baseURL).get(response.header.location);
    expect(redir.status).toBe(200);
    // TODO: check multiple images
    expect(redir.text).toContain(testGalleries[1].title);
  });
});
