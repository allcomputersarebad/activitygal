import "dotenv/config";

import express from "express";
import logger from "morgan";
import createError from "http-errors";

import {
  pageRouter,
  adminRouter,
  galleryRouter,
  aboutRouter,
  contactRouter,
  galleriesRouter,
} from "./routes";

import db from "./models";
db.sequelize.sync();

import adminAuth from "./auth";

const app = express();

app.use(logger("dev"));

app.use("/", express.static("public"));

app.set("view engine", "pug");

app.use("/", pageRouter);
app.use("/gallery", galleryRouter);
app.use("/about", aboutRouter);
app.use("/contact", contactRouter);
app.use("/galleries", galleriesRouter);

if (adminAuth) app.use("/admin", adminAuth, adminRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

export default app;
