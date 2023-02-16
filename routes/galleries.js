import express from "express";
import db from "../models";

const galleriesRouter = express.Router();

/* GET galleries page. */
galleriesRouter.get("/", async function (req, res, next) {
  console.log("entering galleries route");
  const allGalleries = await db.Gallery.findAll({});
  console.log(allGalleries.map((g) => g.dataValues));
  res.render("page", {
    title: "Galleries",
    galleries: allGalleries.map(({ title, description, slug }) => ({
      title,
      description,
      slug,
    })),
  });
});

export default galleriesRouter;
