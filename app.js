import "dotenv/config";

import path from "path";

import express from "express";
import logger from "morgan";
import createError from "http-errors";

import { pageRouter, adminRouter } from "./routes";

import { Sequelize } from "sequelize";
import initDb from "./models";
console.log("init db");
const db = initDb(
  new Sequelize(
    "sqlite:" +
      (process.env.SQLITE_DB ? path.resolve(process.env.SQLITE_DB) : ":memory:")
  )
);
console.log("sequelize sync");
db.sequelize.sync();

import basicAuth from "express-basic-auth";
const adminAuth = process.env.PHOTO_ADMIN
  ? basicAuth({
      users: { admin: process.env.PHOTO_ADMIN },
      challenge: true,
    })
  : false;

const app = express();

console.log("use logger");
app.use(logger("dev"));

console.log("use static");
app.use(express.static("public"));

console.log("use body parsing");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

console.log("set view engine");
app.set("view engine", "pug");

app.use("/", pageRouter);
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
export { db, adminAuth };
