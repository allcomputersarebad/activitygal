import express from "express";
import db from "../models";
import adminAuth from "../auth";

const galleryRouter = express.Router();

galleryRouter.param("slug", async function (req, res, next, slugParam) {
  console.log("gallery param slug", slugParam);
  req.gallery = (
    await db.Gallery.findOne({ where: { slug: slugParam } })
  )?.dataValues;
  console.log("gallery param slug retrieved", req.gallery);
  next();
});

galleryRouter.get("/", adminAuth, async function (req, res, next) {
  const allGalleries = await db.Gallery.findAll();
  res.json(allGalleries);
});

galleryRouter.get("/:slug", function (req, res, next) {
  if (!req.gallery) {
    // res.sendStatus(404);
    res.status(404);
    next();
  } else {
    console.log("gallery get", req.gallery);
    if (req.accepts("html")) {
      res.render("index", {
        title: "Gallery " + req.gallery.name,
        gallery: req.gallery,
      });
    } else if (req.accepts("json")) {
      res.json(req.gallery);
    }
  }
});

galleryRouter.post("/", adminAuth, async function (req, res, next) {
  // TODO: sanitize request data
  const gallery = await db.Gallery.create(req.body);
  res.json(gallery).send();
});

galleryRouter.get("/:slug/:photo", function (req, res, next) {
  if (!req.photo) {
    // res.sendStatus(404);
    res.status(404);
    next();
  } else {
    res.render("index", {
      gallery: req.gallery,
      photo: req.photo,
    });
  }
});

export default galleryRouter;
