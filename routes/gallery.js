import express from "express";
import db from "../models";

const galleryRouter = express.Router();

galleryRouter.use(express.static("gallery"));

galleryRouter.param("slug", async function (req, res, next, slugParam) {
  console.log("gallery param slug", slugParam);
  req.gallery = (
    await db.Gallery.findOne({
      where: { slug: slugParam },
      include: [{ model: db.Photo }],
    })
  )?.dataValues;
  console.log("gallery param slug retrieved", req.gallery);
  next();
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
      // TODO: restrict fields
      res.json(req.gallery);
    }
  }
});

/* // static route
galleryRouter.get("/:slug/:photo", function (req, res, next) {
    res.render("photo", {
      gallery: req.gallery,
      photo: req.photo,
    });
});
*/

export default galleryRouter;
