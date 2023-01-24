import express from "express";

import adminRouter from "./admin.js";

const indexRouter = express.Router();

/* GET home page. */
indexRouter.get("/", function (req, res, next) {
  res.render("index", { title: "Express" });
});

const routes = { index: indexRouter, admin: adminRouter };

export default routes;
