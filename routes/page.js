import express from "express";
import db from "../models";

const pageRouter = express.Router();

pageRouter.param("slug", async function (req, res, next, slugParam) {
  console.log("page param slug", slugParam);
  req.page = (
    await db.Page.findOne({
      where: { slug: slugParam },
      //include: [db.Photo, db.Gallery],
    })
  )?.dataValues;
  console.log("got page", req.page);
  next();
});

/* GET home page. */
pageRouter.get("/", function (req, res, next) {
  res.render("welcome", { title: "ActivityGal" });
});

pageRouter.get("/:slug", function (req, res, next) {
  if (req.page) {
    res.render("index", { title: req.page.title });
  } else {
    res.status(404);
    next();
  }
});

export default pageRouter;
