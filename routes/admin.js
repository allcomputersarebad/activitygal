import express from "express";
import db from "../models";
import uploadParser from "../upload";
import { renderFile } from "pug";

import fs from "fs/promises";
import path from "path";

const fsRoot = process.env.PERSISTENT_STORAGE;

const adminRouter = express.Router();

adminRouter.get("/", async function (req, res, next) {
  console.log("admin root", req.auth);
  const allGalleries = await db.Gallery.findAll({
    attributes: ["id", "slug", "title"],
  });
  const allPages = await db.Page.findAll({ attributes: ["id", "title"] });
  const pageData = {
    title: "Welcome " + req.auth.user,
    // TODO: is this map necessary?
    galleries: allGalleries.map((g) => g.dataValues),
    pages: allPages.map((p) => p.dataValues),
  };
  res.render("admin", pageData);
});

// TODO: multiple galleries/containers per photo? here or elsewhere?
adminRouter.post(
  "/photo",
  uploadParser.array("photos"),
  async function (req, res, next) {
    const [photos, targetId] = [req.files, req.body.target];
    const toTarget = await db.Gallery.findOne({
      where: { id: targetId },
    });
    // TODO: data per photo
    const photoUploads = await Promise.all(
      photos.map((photo) =>
        fs
          .rename(photo.path, path.join(fsRoot, "photo", photo.filename))
          .then(() =>
            toTarget.createPhoto({
              type: photo.mimetype,
              resource: photo.filename,
              originalname: photo.originalname,
            })
          )
      )
    );

    // TODO: better json vs html/htmx response
    if (req.accepts("html")) {
      const singleGallery = await db.Gallery.findOne({
        where: { id: req.body.target },
        attributes: ["id", "title", "description"],
        include: db.Photo,
      });
      res.send(
        renderFile("views/adminUploadPhotoReload.pug", {
          galleryTitle: singleGallery.dataValues.title,
          galleryDescription: singleGallery.dataValues.description,
          galleryId: singleGallery.dataValues.id,
          photos: singleGallery.dataValues.Photos,
        })
      );
    } else if (req.accepts("json")) {
      res.json(photoUploads);
    }
  }
);

// TODO: paginate
adminRouter.get("/gallery", (req, res) => {
  db.Gallery.findAll().then((allGalleries) => res.json(allGalleries));
});
adminRouter.get("/page", (req, res) => {
  db.Page.findAll().then((allPages) => res.json(allPages));
});
adminRouter.get("/photo", (req, res) => {
  db.Photo.findAll().then((allPhotos) => res.json(allPhotos));
});

// single gallery data for loading the gallery data into the update form
adminRouter.get("/single", async function (req, res) {
  console.log("entering single gallery route");
  console.log(req.query);
  if (req.query.galleryId === "") {
    res.send(renderFile("views/adminGalleryForm.pug"));
  } else {
    const singleGallery = await db.Gallery.findOne({
      where: { id: req.query.galleryId },
      attributes: ["id", "title", "description"],
      include: db.Photo,
    });
    console.log(singleGallery.dataValues);
    console.log(singleGallery.dataValues.description);
    res.send(
      renderFile("views/adminGalleryFormWithPhotos.pug", {
        galleryTitle: singleGallery.dataValues.title,
        galleryDescription: singleGallery.dataValues.description,
        galleryId: singleGallery.dataValues.id,
        photos: singleGallery.dataValues.Photos,
      })
    );
  }
});

// single page data
adminRouter.get("/singlepage", async function (req, res) {
  console.log("entering single page route");
  console.log(req.query);
  if (req.query.pageId === "") {
    res.send(
      renderFile("views/adminPageForm.pug", {
        pageTitle: "",
      })
    );
  } else {
    const singlePage = await db.Page.findOne({
      where: { id: req.query.pageId },
      attributes: ["id", "title"],
    });
    console.log(singlePage.dataValues.title);
    res.send(
      renderFile("views/adminPageForm.pug", {
        pageTitle: singlePage.dataValues.title,
      })
    );
  }
});

adminRouter.post(
  "/gallery",
  express.urlencoded({ extended: true /* shut up deprecated */ }),
  async function (req, res, next) {
    console.log("gallery post");
    const galleryId = req.body?.galleryId;
    const galleryForm = {
      title: req.body?.title,
      description: req.body?.description,
      PageId: req.body?.PageId,
    };
    if (galleryId) {
      const galleryToUpdate = await db.Gallery.findOne({
        where: { id: galleryId },
      });
      const galleryUpdated = await galleryToUpdate.update(galleryForm);
      res.redirect("/admin");
    } else {
      const galleryCreated = await db.Gallery.create(galleryForm);
      res.redirect("/admin");
    }
  }
);

adminRouter.post(
  "/page",
  express.urlencoded({ extended: true /* shut up deprecated */ }),
  async function (req, res, next) {
    console.log("page post");
    const pageId = req.body?.PageId;
    const pageForm = {
      title: req.body?.title,
      description: req.body?.description,
    };
    if (pageId) {
      const pageToUpdate = await db.Page.findOne({
        where: { id: pageId },
      });
      const pageUpdated = await pageToUpdate.update(pageForm);
      res.json(pageUpdated);
    } else {
      const pageCreated = await db.Page.create(pageForm);
      res.json(pageCreated);
    }
  }
);

export default adminRouter;
