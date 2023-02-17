import express from "express";
import db from "../models";

const galleryRouter = express.Router();

galleryRouter.use(express.static("gallery"));

galleryRouter.param("slug", async function (req, res, next, slugParam) {
  console.log("gallery param slug", slugParam);
  req.gallery = await db.Gallery.findOne({
    where: { slug: slugParam },
    include: db.Photo,
  });
  if (!req.gallery) res.sendStatus(404);
  else next();
});

galleryRouter.param("ext", async function (req, res, next, extParam) {
  console.log("gallery param ext", extParam);
  req.ext = extParam;
  next();
});

galleryRouter.get("/:slug.:ext?", async function (req, res, next) {
  //if (req.accepts("json")) res.json(req.gallery);
  //else if (req.accepts("html"))
  if (req.ext === "json") {
    console.log("ext .json requested", req.json);
    res.contentType("application/activity+json");
    res.json(await req.gallery.note());
  } else {
    console.log("rendering gallery", req.gallery);
    res.render("gallery", {
      title: req.gallery.title,
      gallery: req.gallery.dataValues,
      photos: req.gallery?.Photos,
      activityId: req.gallery?.activityId,
    });
  }
});

galleryRouter.get("/:slug.json", async function (req, res, next) {
  res.contentType("application/activity+json");
  res.json(req.gallery.note());
});

export default galleryRouter;
