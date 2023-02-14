import express from "express";
import db from "../models";
import uploadParser from "../upload";
import { renderFile } from "pug";

import fs from "fs/promises";
import path from "path";

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
          .copyFile(
            photo.path,
            path.join(req.app.settings.photoStorage, photo.filename)
          )
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
      console.log(singleGallery.dataValues.Photos);
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
      include: [db.Photo, db.Page],
    });
    const allPages = await db.Page.findAll({ attributes: ["id", "title"] });
    console.log(allPages);
    console.log(singleGallery.dataValues);
    console.log(singleGallery.dataValues.description);
    res.send(
      renderFile("views/adminGalleryFormWithPhotos.pug", {
        galleryTitle: singleGallery.dataValues.title,
        galleryDescription: singleGallery.dataValues.description,
        galleryId: singleGallery.dataValues.id,
        photos: singleGallery.dataValues.Photos,
        currentPage: singleGallery.dataValues.Page
          ? singleGallery.dataValues.Page.dataValues.title
          : "",
        pages: allPages,
      })
    );
  }
});

// single page data
adminRouter.get("/singlepage", async function (req, res) {
  console.log("entering single page route");
  console.log(req.query);
  if (req.query.pageId === "") {
    res.send(renderFile("views/adminPageFormCreate.pug", {}));
  } else {
    const singlePage = await db.Page.findOne({
      where: { id: req.query.pageId },
      attributes: ["id", "title"],
    });
    console.log(singlePage.dataValues.title);
    res.send(
      renderFile("views/adminPageFormUpdate.pug", {
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
    console.log(req.body);
    const galleryId = req.body?.galleryId;
    const galleryForm = {
      title: req.body?.title,
      description: req.body?.description,
    };
    const pageAssoc =
      req.body?.PageId &&
      (await db.Page.findOne({ where: { id: req.body?.PageId } }));
    let responseGallery;
    if (galleryId) {
      const galleryToUpdate = await db.Gallery.findOne({
        where: { id: galleryId },
      });
      responseGallery = await galleryToUpdate.update(galleryForm);
    } else {
      responseGallery = await db.Gallery.create(galleryForm);
    }
    await responseGallery.setPage(pageAssoc);
    if (!req.body?.photoId && req.accepts("json")) res.json(responseGallery);
    else {
      // upload photos
      console.log("in the photoUpdate route");
      if (typeof req.body.photoId === "string") {
        console.log("i'm a single photo ****");
        const photoToUpdate = await db.Photo.findOne({
          where: { id: req.body.photoId },
        });
        const photoForm = {
          title: req.body.photoTitle,
          caption: req.body.photoCaption,
          description: req.body.photoDescription,
        };
        console.log(photoForm);
        const responsePhoto = photoToUpdate.update(photoForm);
      } else {
        for (const [i, photoId] of req.body.photoId.entries()) {
          const photoToUpdate = await db.Photo.findOne({
            where: { id: photoId },
          });
          const photoForm = {
            title: req.body.photoTitle[i],
            caption: req.body.photoCaption[i],
            description: req.body.photoDescription[i],
          };
          console.log("_______$$$$$", photoForm);
          const responsePhoto = photoToUpdate.update(photoForm);
        }
      }
      res.redirect("/admin");
    }
  }
);

adminRouter.post(
  "/page",
  express.urlencoded({ extended: true /* shut up deprecated */ }),
  async function (req, res, next) {
    console.log("page post");
    const pageId = req.body?.pageId;
    const pageForm = {
      title: req.body?.title,
      description: req.body?.description,
    };
    if (pageId) {
      const pageToUpdate = await db.Page.findOne({
        where: { id: pageId },
      });
      const pageUpdated = await pageToUpdate.update(pageForm);
      if (req.accepts("json")) res.json(pageUpdated);
      else res.redirect("/admin");
    } else {
      const pageCreated = await db.Page.create(pageForm);
      if (req.accepts("json")) res.json(pageCreated);
      else res.redirect("/admin");
    }
  }
);

export default adminRouter;
