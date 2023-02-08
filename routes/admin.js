import express from "express";
import db from "../models";
import uploadParser from "../upload";

import fs from "fs/promises";
import path from "path";

const fsRoot = process.env.PERSISTENT_STORAGE;

const adminRouter = express.Router();

adminRouter.get("/", async function (req, res, next) {
  console.log("admin root", req.auth);
  const allGalleries = await db.Gallery.findAll({
    attributes: ["id", "slug"],
  });
  const allPages = await db.Page.findAll({ attributes: ["id", "slug"] });
  const pageData = {
    title: "auth: " + req.auth.user,
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
    const toTarget =
      (await db.Gallery.findOne({
        where: { id: targetId },
      })) ||
      (await db.Page.findOne({
        where: { id: targetId },
      }));
    photos.forEach((photo) => {
      const newPath = path.join(fsRoot, "photo", photo.filename);
      fs.rename(photo.path, newPath).then(() =>
        toTarget.createPhoto({
          type: photo.mimetype,
          resource: photo.filename,
          originalname: photo.originalname,
        })
      );
    });
    if (req.accepts("html")) {
      res.redirect(toTarget.path);
    } else if (req.accepts("json")) {
      res.json(toTarget);
    }
    //next();
    //res.redirect("/admin");
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

adminRouter.post(
  "/gallery",
  express.urlencoded({ extended: true /* shut up deprecated */ }),
  async function (req, res, next) {
    console.log("gallery post");
    const galleryId = req.body?.gallery;
    const galleryForm = {
      title: req.body?.title,
      description: req.body?.description,
    };
    if (galleryId) {
      const galleryToUpdate = await db.Gallery.findOne({
        where: { id: galleryId },
      });
      const galleryUpdated = await galleryToUpdate.update(galleryForm);
      res.json(galleryUpdated);
    } else {
      const galleryCreated = await db.Gallery.create(galleryForm);
      res.json(galleryCreated);
    }
  }
);

adminRouter.post(
  "/page",
  express.urlencoded({ extended: true /* shut up deprecated */ }),
  async function (req, res, next) {
    console.log("page post");
    const pageId = req.body?.page;
    //const pageForm = (({ title, description }) => ({ title, description }))(req.body);
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
