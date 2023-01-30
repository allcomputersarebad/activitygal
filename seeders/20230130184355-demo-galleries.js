"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("Galleries", null, {});
    await queryInterface.bulkDelete("Photos", null, {});
    await queryInterface.bulkDelete("GalleryPhotos", null, {});
    await queryInterface.bulkInsert("Galleries", [
      {
        name: "Demo Gal",
        description: "A gallery demonstration",
        slug: "demo-gal",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Another Demo",
        description: "Another gallery demonstration",
        slug: "another-demo",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Even More Demo",
        description: "Even more demonstration",
        slug: "even-more-demo",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Hidden Demo",
        description: "Hidden gallery demonstration",
        slug: "hidden-demo",
        //hidden: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Empty Demo",
        description: "Empty gallery demonstration",
        slug: "empty-demo",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Additional Demo",
        description: "Additional gallery demonstration",
        slug: "additional-demo",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
    await queryInterface.bulkInsert("Photos", [
      {
        path: "/mock_data/blue1.jpg",
        uuid: "b1",
        slug: "blue1",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        path: "/mock_data/blue2.jpg",
        uuid: "b2",
        slug: "blue2",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        path: "/mock_data/blue3.jpg",
        uuid: "b3",
        slug: "blue3",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        path: "/mock_data/blue4.jpg",
        uuid: "b4",
        slug: "blue4",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
    await queryInterface.bulkInsert("GalleryPhotos", [
      {
        PhotoId: 1,
        GalleryId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        PhotoId: 2,
        GalleryId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        PhotoId: 3,
        GalleryId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        PhotoId: 4,
        GalleryId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("Galleries", null, {});
    await queryInterface.bulkDelete("Photos", null, {});
    await queryInterface.bulkDelete("GalleryPhotos", null, {});
  },
};
