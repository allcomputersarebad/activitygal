import express from "express";
import db from "../models";

const photoRouter = express.Router();

// TODO: restrict outgoing fields
photoRouter.param("slug", async function (req, res, next, slugParam) {
  console.log("photo param slug", slugParam);
  req.photo = (
    await db.Photo.findOne({
      where: { slug: slugParam },
    })
  )?.dataValues;
  next();
});

photoRouter.get("/:slug", function (req, res, next) {
  if (!req.photo || req.photo?.hidden) {
    // res.sendStatus(404);
    res.status(404);
    next();
  } else {
    if (req.accepts("html")) {
      res.render("photo", {
        photo: req.photo,
      });
    } else if (req.accepts("json")) {
      // TODO: restrict outgoing fields
      res.json(req.photo);
    }
  }
});

export default photoRouter;
