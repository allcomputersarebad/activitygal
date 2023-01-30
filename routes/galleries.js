import express from "express";

const galleriesRouter = express.Router();

/* GET galleries page. */
galleriesRouter.get("/", function (req, res, next) {
  res.render("galleries", { title: "Galleries" });
});

export default galleriesRouter;
