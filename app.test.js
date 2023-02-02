const request = require("supertest");
const baseURL = "http://localhost:3000";
const mockPhotoPath = "mock_data";
const fs = require("fs");
const path = require("path");

const app = require("./app").default;
//const db = require("./models");

const auth = {
  user: "admin",
  pass: process.env.PHOTO_ADMIN,
};

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
    title: "Page 2",
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
    testGalleries.push(
      (
        await request(baseURL)
          .post("/admin/gallery")
          .send(gal)
          .auth(auth.user, auth.pass)
      )?.body
    );
  }
  return testGalleries;
};
const createMockPages = async () => {
  const testPages = Array();
  for (let pg of mockPages) {
    testPages.push(
      (
        await request(baseURL)
          .post("/admin/page")
          .send(pg)
          .auth(auth.user, auth.pass)
      )?.body
    );
  }
  return testPages;
};

// TODO: test page rendering

let server;

beforeAll(
  async () =>
    new Promise((resolve) => {
      server = app.listen("3000", resolve);
    })
);

afterAll(async () => new Promise((resolve) => server.close(resolve)));

describe("create and get galleries and pages", () => {
  it("can create several galleries", async () => {
    const testGalleries = await createMockGalleries();
    expect(testGalleries.length).toBe(mockGalleries.length);
  });
  it("can create several pages", async () => {
    const testPages = await createMockPages();
    //expect((await db.Gallery.findAll()).length).toBe(mockGalleries.length);
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
      .auth(auth.user, auth.pass)
      .field("target", testGalleries[0]?.uuid)
      .attach("photos", mockPhotoRefs.red[0]);
    expect(response.status).toBe(302);
    expect(response.header.location).toBe(testGalleries[0].path);
    const redir = await request(baseURL)
      .get(response.header.location)
      .auth(auth.user, auth.pass);
    expect(redir.status).toBe(200);
    expect(redir.text).toContain(testGalleries[0].title);
  });
  it("can post multiple photos to a gallery", async () => {
    const response = await request(baseURL)
      .post("/admin/photo")
      .auth(auth.user, auth.pass)
      .field("target", testGalleries[1]?.uuid)
      .attach("photos", ...mockPhotoRefs.blue);
    expect(response.status).toBe(302);
    expect(response.header.location).toBe(testGalleries[1].path);
    const redir = await request(baseURL)
      .get(response.header.location)
      .auth(auth.user, auth.pass);
    expect(redir.status).toBe(200);
    // TODO: check multiple images
    expect(redir.text).toContain(testGalleries[1].title);
  });
  it("can post a single photo to a page", async () => {
    const response = await request(baseURL)
      .post("/admin/photo")
      .auth(auth.user, auth.pass)
      .field("target", testPages[0].uuid)
      .attach("photos", mockPhotoRefs.green[0]);
    expect(response.status).toBe(302);
    expect(response.header.location).toBe(testPages[0].path);
    const redir = await request(baseURL)
      .get(response.header.location)
      .auth(auth.user, auth.pass);
    expect(redir.status).toBe(200);
    expect(redir.text).toContain(testPages[0].title);
  });
  it("can post multiple photos to a page", async () => {
    const response = await request(baseURL)
      .post("/admin/photo")
      .auth(auth.user, auth.pass)
      .field("target", testPages[1].uuid)
      .attach("photos", ...mockPhotoRefs.blue);
    expect(response.status).toBe(302);
    expect(response.header.location).toBe(testPages[1].path);
    const redir = await request(baseURL)
      .get(response.header.location)
      .auth(auth.user, auth.pass);
    expect(redir.status).toBe(200);
    expect(redir.text).toContain(testPages[1].title);
  });
});
