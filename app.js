import "dotenv/config";

import express from "express";
import logger from "morgan";

import config from "./config.js";
import basicAuth from "express-basic-auth";

import db from "./models";
import routes from "./routes";

import createError from "http-errors";

const app = express();

app.use(logger("dev"));

app.use(express.static("public"));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.set("view engine", "pug");

app.use("/", routes.index);
if (config.auth) app.use("/admin", basicAuth(config.auth), routes.admin);

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
