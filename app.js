import "dotenv/config";

import express from "express";
import logger from "morgan";
const app = express();

app.set(
  "publicRoot",
  `${process.env.PROTOCOL}://${process.env.HOST}:${process.env.PORT}`
);
app.set("publicHost", process.env.HOST);

app.set("view engine", "pug");
app.use(logger("dev"));

app.use("/", express.static("public"));
import {
  pageRouter,
  galleryRouter,
  aboutRouter,
  contactRouter,
  galleriesRouter,
  activityRouter,
} from "./routes";
app.use("/", pageRouter);
app.use("/", activityRouter);
app.use("/gallery", galleryRouter);
app.use("/photo", express.static("photo"));
app.use("/about", aboutRouter);
app.use("/contact", contactRouter);
app.use("/galleries", galleriesRouter);

import auth from "./config/auth";
import basicAuth from "express-basic-auth";
import { adminRouter } from "./routes";
if (auth) app.use("/admin", basicAuth(auth), adminRouter);

import createError from "http-errors";
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

import db from "./models";
db.sequelize.sync();

export default app;
