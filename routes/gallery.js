import express from "express";
import db from "../models";
//import { URL } from "url";
//const baseUrl = new URL(process.env.PROTOCOL + process.env.DOMAIN);

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

galleryRouter.get("/:slug", function (req, res, next) {
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
      //res.json(req.gallery.noteJson(baseUrl));
      // TODO: restrict outgoing fields
      res.json(req.gallery);
    }
  }
});

export default galleryRouter;
