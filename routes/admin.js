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
  express.json(),
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

// TODO: sanitize req.body
adminRouter.post(
  "/gallery",
  express.json(),
  express.urlencoded(),
  async function (req, res, next) {
    if (req.body?.gallery) {
      const galleryToUpdate = await db.Gallery.findOne({
        where: { id: req.body.gallery },
      });
      const galleryUpdated = await galleryToUpdate.update({
        title: req.body.title,
      });
      res.json(galleryUpdated);
    } else {
      const galleryCreated = await db.Gallery.create({ title: req.body.title });
      res.json(galleryCreated);
    }
  }
);

adminRouter.post(
  "/page",
  express.json(),
  express.urlencoded(),
  async function (req, res, next) {
    if (req.body?.page) {
      const pageToUpdate = await db.Page.findOne({
        where: { id: req.body.page },
      });
      const pageUpdated = await pageToUpdate.update({ title: req.body.title });
      res.json(pageUpdated);
    } else {
      const pageCreated = await db.Page.create({ title: req.body.title });
      res.json(pageCreated);
    }
  }
);

export default adminRouter;
