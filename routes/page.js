import express from "express";
import db from "../models";

import { Actor } from "../activity";

const pageRouter = express.Router();

pageRouter.param("slug", async function (req, res, next, slugParam) {
  console.log("page param slug", slugParam);
  req.page = await db.Page.findOne({
    where: { slug: slugParam },
    include: [db.Gallery],
  });
  console.log("got page", req.page);
  next();
});

/* GET home page. */
pageRouter.get("/", async function (req, res, next) {
  const page = await db.Page.findOne({
    where: { slug: "index" },
    include: [db.Gallery],
  });
  res.render("welcome", {
    ...(page ?? {}),
    title: page?.title ?? "ActivityGal",
  });
});

pageRouter.get("/:slug", function (req, res, next) {
  if (req.page) {
    if (req.accepts("json")) res.json(req.page);
    else if (req.accepts("html")) {
      res.render("index", {
        title: req.page.title,
        //galleries: page?.Galleries,
      });
    }
  } else {
    //res.status(404); // TODO: wtf
    next();
  }
});

pageRouter.get("/:slug.json", function (req, res, next) {
  res.contentType("application/activity+json");
  const pageActor = new Actor(req.page);
  res.json(pageActor);
});

pageRouter.get("/:slug/outbox.json", function (req, res, next) {
  const { page, min, max } = { ...req.query };
  res.contentType("application/activity+json");
  const pageActor = new Actor(req.page);
  res.json(pageActor.outbox(page, min, max));
});

export default pageRouter;
