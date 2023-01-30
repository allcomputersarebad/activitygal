import express from "express";

const contactRouter = express.Router();

/* GET contact page. */
contactRouter.get("/", function (req, res, next) {
  res.render("contact", { title: "Contact" });
});

export default contactRouter;
