const request = require("supertest");
const baseURL = "http://localhost:3000";
const mockPhotoPath = "mock_data";
const fs = require("fs");
const path = require("path");

const app = require("./app").default;
const db = require("./models").default;

const auth = ["admin", process.env.PHOTO_ADMIN];

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
];

const mockPages = [
  {
    title: "Demo Page",
    description: "A page demonstration",
  },
  {
    title: "Page Two",
    description: "Another page demonstration",
  },
  {
    title: "More Page",
    description: "Demonstrating more page",
  },
  {
    title: "Hidden Page",
    description: "Hidden page demonstration",
    hidden: true,
  },
  {
    title: "Empty Page",
    description: "Empty page demonstration",
  },
  {
    title: "Additional Page",
    description: "Additional page demonstration",
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
    dir, // gallery name
    fs // gallery photos
      .readdirSync(path.resolve(mockPhotoPath, dir))
      .filter((file) => path.extname(file) === ".jpg")
      .map((leaf) => path.resolve(mockPhotoPath, dir, leaf)),
  ])
);

const createMockGalleries = async () => {
  const testGalleries = Array();
  for (let gal of mockGalleries) {
    const galResult = await request(baseURL)
      .post("/admin/gallery")
      .auth(...auth)
      .type("form")
      .send(gal);
    testGalleries.push(galResult?.body);
  }
  return testGalleries;
};
const createMockPages = async () => {
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

// TODO: test page rendering

let server;

beforeAll(function (done) {
  db.sequelize.sync().then(() => {
    server = app.listen("3000", done);
  });
});

afterAll(function (done) {
  server.close(done);
});

describe("create and get galleries and pages", () => {
  it("can create several galleries", async () => {
    const testGalleries = await createMockGalleries();
    expect(testGalleries.length).toBe(mockGalleries.length);
  });
  it("can create several pages", async () => {
    const testPages = await createMockPages();
    expect(testPages.length).toBe(mockPages.length);
  });
});

describe("get routes", () => {
  let testGalleries;
  let testPages;
  beforeAll(async () => {
    testGalleries = await createMockGalleries();
    testPages = await createMockPages();
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

  describe("page gets", () => {
    it("can get one page", async () => {
      const response = await request(baseURL).get(testPages[0].path);
      expect(response.status).toBe(200);
    });
  });
});

describe("photo creation", () => {
  let testGalleries;
  let testPages;
  beforeAll(async () => {
    testGalleries = await createMockGalleries();
    testPages = await createMockPages();
  });
  // create galleries and pages
  it("can post a single photo to a gallery", async () => {
    const response = await request(baseURL)
      .post("/admin/photo")
      .type("form")
      .auth(...auth)
      .field("target", testGalleries[0]?.id)
      .attach("photos", mockPhotoRefs.red[0]);
    expect(response.status).toBe(302);
    expect(response.header.location).toBe(testGalleries[0].path);
    const redir = await request(baseURL).get(response.header.location);
    expect(redir.status).toBe(200);
    expect(redir.text).toContain(testGalleries[0].title);
  });
  it("can post multiple photos to a gallery", async () => {
    const response = await request(baseURL)
      .post("/admin/photo")
      .type("form")
      .auth(...auth)
      .field("target", testGalleries[1]?.id)
      .attach("photos", ...mockPhotoRefs.blue);
    expect(response.status).toBe(302);
    expect(response.header.location).toBe(testGalleries[1].path);
    const redir = await request(baseURL).get(response.header.location);
    expect(redir.status).toBe(200);
    // TODO: check multiple images
    expect(redir.text).toContain(testGalleries[1].title);
  });
});
