import dotenv from "dotenv";
dotenv.config();

import express from "express";
import logger from "morgan";

import basicAuth from "express-basic-auth";

import indexRouter from "./routes/index";
import adminRouter from "./routes/admin";

import createError from "http-errors";

const app = express();

app.use(logger("dev"));

app.use(express.json());
app.use(express.urlencoded());

app.set("view engine", "pug");
app.use(express.static("public"));

app.use("/", indexRouter);

const adminAuth = basicAuth({
  users: { admin: process.env.PHOTO_ADMIN },
  challenge: true,
});
app.use("/admin", adminAuth, adminRouter);

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

module.exports = app;
