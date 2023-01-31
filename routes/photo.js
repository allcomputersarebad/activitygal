import express from "express";
import db from "../models";

const photoRouter = express.Router();

// TODO: restrict outgoing fields
photoRouter.param("resource", async function (req, res, next, resourceParam) {
  console.log("photo param resource", resourceParam);
  req.photo = (
    await db.Photo.findOne({
      where: { resource: resourceParam },
    })
  )?.dataValues;
  next();
});

photoRouter.get("/:resource", function (req, res, next) {
  console.log("rendering photo", req.photo);
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
