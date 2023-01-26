import express from "express";

const aboutRouter = express.Router();

/* GET about page. */
aboutRouter.get("/", function (req, res, next) {
  res.render("about", { title: "About" });
});

export default aboutRouter;
