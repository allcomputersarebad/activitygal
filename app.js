import "dotenv/config";

import fs from "fs";
import path from "path";

import express from "express";
import logger from "morgan";
const app = express();

app.set("publicHost", process.env.EXTERNAL_HOST ?? false);

app.set(
  "rootUrl",
  `${process.env.EXTERNAL_PROTOCOL ?? "http"}://${
    process.env.EXTERNAL_HOST ?? `localhost:${process.env.PORT ?? 3000}`
  }`
);

app.set(
  "photoStorage",
  path.resolve(process.env.PERSISTENT_STORAGE ?? __dirname, "photo")
);
fs.mkdirSync(app.get("photoStorage"), { recursive: true });

app.set("view engine", "pug");
app.use(logger("dev"));

app.use("/", express.static("public"));
import {
  pageRouter,
  galleryRouter,
  aboutRouter,
  contactRouter,
  galleriesRouter,
  inboxRouter,
  webfingerRouter,
} from "./routes";
app.use("/photo", express.static(app.get("photoStorage")));
app.use("/gallery", galleryRouter);
app.use("/about", aboutRouter);
app.use("/contact", contactRouter);
app.use("/galleries", galleriesRouter);
app.use("/inbox", inboxRouter);
app.use("/.well-known/webfinger", webfingerRouter);
app.use("/", pageRouter);

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
