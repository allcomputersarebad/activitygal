import express from "express";
import db from "../models";

const galleryRouter = express.Router();

galleryRouter.use(express.static("gallery"));

// TODO: restrict outgoing fields
galleryRouter.param("slug", async function (req, res, next, slugParam) {
  console.log("gallery param slug", slugParam);
  req.gallery = (
    await db.Gallery.findOne({
      where: { slug: slugParam },
      include: db.Photo,
    })
  )?.dataValues;
  //req.gallery.Photos = req.gallery?.Photos?.map((p) => p?.dataValues);
  next();
});

galleryRouter.param("photo", async function (req, res, next, photoSlug) {
  console.log("gallery param photoSlug", photoSlug);
  req.photo = (
    await db.Photo.findOne({
      where: { slug: photoSlug },
    })
  )?.dataValues;
  next();
});

galleryRouter.get("/:slug", function (req, res, next) {
  console.log("rendering gallery", req.gallery);
  if (!req.gallery || req.gallery?.hidden) {
    // res.sendStatus(404);
    res.status(404);
    next();
  } else {
    if (req.accepts("html")) {
      res.render("gallery", {
        title: req.gallery.title,
        gallery: req.gallery,
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
      // TODO: restrict outgoing fields
      res.json(req.gallery);
    }
  }
});

// static route
galleryRouter.get("/:slug/:photo", function (req, res, next) {
  res.render("photo", {
    gallery: req.gallery,
    photo: req.photo,
  });
});

export default galleryRouter;
