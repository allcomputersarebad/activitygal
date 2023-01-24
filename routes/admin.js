import express from "express";

const adminRouter = express.Router();

/* GET home page. */
adminRouter.get("/", function (req, res, next) {
  console.log("admin route", req.auth);
  res.render("index", { title: "Express" + req.auth.user, auth: req.auth });
});

export default adminRouter;
