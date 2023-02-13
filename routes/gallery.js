import express from "express";
import db from "../models";

import { Actor, Activity } from "../activity";

const galleryRouter = express.Router();

galleryRouter.use(express.static("gallery"));

galleryRouter.param("slug", async function (req, res, next, slugParam) {
  console.log("gallery param slug", slugParam);
  req.gallery = await db.Gallery.findOne({
    where: { slug: slugParam },
    include: db.Photo,
  });
  console.log("req.gallery assigned", req.gallery);
  next();
});

galleryRouter.get("/:slug", async function (req, res, next) {
  console.log("rendering gallery", req.gallery);
  if (!req.gallery) {
    res.status(404); //res.sendStatus(404);
    next();
  } else {
    if (req.accepts("html")) {
      res.render("gallery", {
        title: req.gallery.title,
        gallery: req.gallery.dataValues,
        photos: req.gallery?.Photos.map(
          ({ altText, caption, description, path, title, uuid }) => ({
            altText,
            caption,
            description,
            path,
            title,
            uuid,
          })
        ),
      });
    } else if (req.accepts("json")) {
      const page = await req.gallery.getPage();
      const activityGal = new Activity(req.gallery, new Actor(page));
      res.json(activityGal.create());
    }
  }
});

galleryRouter.get("/:slug.json", async function (req, res, next) {
  res.contentType("application/activity+json");
  if (req.gallery) {
    const page = await req.gallery.getPage();
    const activityGal = new Activity(req.gallery, new Actor(page));
    res.json(activityGal.create());
  } else {
    res.sendStatus(404);
    next();
  }
});

export default galleryRouter;
