import express from "express";
import db from "../models";

const pageRouter = express.Router();

pageRouter.param("slug", async function (req, res, next, slugParam) {
  console.log("page param slug", slugParam);
  const page = await db.Page.findOne({
    where: { slug: slugParam },
    include: [db.Gallery],
  });
  req.page = page;
  req.galleries = page?.Galleries;
  console.log("page selected", req.page);
  next();
});

pageRouter.param("ext", async function (req, res, next, extParam) {
  console.log("page param ext", extParam);
  req.ext = extParam;
  next();
});

/* GET home page. */
pageRouter.get("/", async function (req, res, next) {
  const allPages = await db.Page.findAll();
  res.render("welcome", {
    pages: allPages.map(({ title, slug }) => ({
      title,
      slug,
    })),
  });
});

pageRouter.get("/:slug.:ext?", function (req, res, next) {
  if (req.page) {
    console.log("page exists", req.page);
    if (req.ext === "json") {
      console.log("ext .json requested", req.json);
      res.contentType("application/activity+json");
      res.json(req.page.actor());
    } else {
      //if (req.accepts("json")) res.json(req.page);
      //else if (req.accepts("html"))
      console.log("rendering page");
      console.log("page galleries", req.galleries);
      res.render("page", {
        title: req.page?.title,
        galleries: req.galleries?.map((g) => g.dataValues) ?? [],
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
