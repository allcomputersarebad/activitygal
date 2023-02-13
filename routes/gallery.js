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

galleryRouter.get("/:slug", async function (req, res, next) {
  console.log("rendering gallery", req.gallery);
  if (req.accepts("json")) res.json(req.gallery);
  else if (req.accepts("html"))
    res.render("gallery", {
      title: req.gallery.title,
      gallery: req.gallery.dataValues,
      photos: req.gallery?.Photos,
    });
});

galleryRouter.get("/:slug.json", async function (req, res, next) {
  res.contentType("application/activity+json");
  res.json(req.gallery.note());
});

export default galleryRouter;
