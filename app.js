import "dotenv/config";

import express from "express";
import logger from "morgan";

import baseUrl from "./config/external";
import { publicDir, photoDir } from "./config/dirs";

import {
  adminRouter,
  galleryRouter,
  inboxRouter,
  wellknownRouter,
  pageRouter,
} from "./routes";

import auth from "./config/auth";
import basicAuth from "express-basic-auth";

import db from "./models";

const app = express();

app.set("publicHost", baseUrl.hostname);
app.set("baseUrl", baseUrl);
app.set("photoDir", photoDir);

app.use("/", express.static(publicDir));
app.use("/photo", express.static(photoDir));

app.set("view engine", "pug");
app.use(logger("dev"));

if (auth) app.use("/admin", basicAuth(auth), adminRouter);

app.use("/gallery", galleryRouter);
app.use("/inbox", inboxRouter);
app.use("/.well-known", wellknownRouter);
app.use("/", pageRouter); // has catch-all, must be last

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

db.sequelize.sync();

export default app;
