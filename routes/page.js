import express from "express";

const pageRouter = express.Router();

/* GET home page. */
pageRouter.get("/", function (req, res, next) {
  res.render("index", { title: "ActivityGal" });
});

export default pageRouter;
