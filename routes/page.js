import express from "express";
import db from "../models";

const pageRouter = express.Router();

pageRouter.param("slug", async function (req, res, next, slugParam) {
  console.log("page param slug", slugParam);
  req.page = await db.Page.findOne({
    where: { slug: slugParam },
    include: [db.Gallery],
  });
  next();
});

pageRouter.param("ext", async function (req, res, next, extParam) {
  console.log("page param ext", extParam);
  req.ext = extParam;
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

pageRouter.get("/:slug.:ext?", function (req, res) {
  if (req.page) {
    if (req.ext === "json") {
      res.contentType("application/activity+json");
      res.json(req.page.actor());
    } else {
      if (req.accepts("json")) res.json(req.page);
      else if (req.accepts("html"))
        res.render("index", {
          title: req.page?.title,
          galleries: req.page?.Galleries,
        });
    }
  } else {
    // TODO: a 404 breaks other routes. how else to handle?
    //res.status(404);
    next();
  }
});

pageRouter.get("/:slug/outbox", async function (req, res) {
  const { page, min, max } = { ...req.query };
  res.contentType("application/activity+json");
  const outboxJson = await req.page.outbox(page, min, max);
  res.json(outboxJson);
});

pageRouter.get("/:slug/followers", async function (req, res) {
  res.contentType("application/activity+json");
  res.sendStatus(403);
});

export default pageRouter;
