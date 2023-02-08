import express from "express";
import db from "../models";
import { URL } from "url";

const baseUrl = new URL(process.env.PROTOCOL + process.env.DOMAIN);
const pageRouter = express.Router();

pageRouter.param("slug", async function (req, res, next, slugParam) {
  console.log("page param slug", slugParam);
  req.page = await db.Page.findOne({
    where: { slug: slugParam },
    include: [db.Gallery], // TODO: this properly
  });
  console.log("got page", req.page);
  next();
});

/* GET home page. */
pageRouter.get("/", async function (req, res, next) {
  page = await db.Page.findOne({
    where: { slug: "index" },
    include: [db.Gallery],
  });
  res.render("welcome", {
    ...page,
    title: page?.title ?? "ActivityGal",
  });
});

pageRouter.get("/:slug", function (req, res, next) {
  if (req.page) {
    if (req.accepts("json")) res.redirect(req.page.path + ".json");
    else
      res.render("index", {
        title: req.page.title,
        //galleries: page?.Galleries,
        //photos: page?.Photos,
      });
  } else {
    //res.status(404); // TODO: wtf
    next();
  }
});

pageRouter.get("/:slug.json", function (req, res, next) {
  res.contentType("application/activity+json");
  res.json(req.page.actorJson(baseUrl));
});

// https://domain/.well-known/webfinger?resource=acct:user@example.com
pageRouter.get("/.well-known/webfinger", async (req, res, next) => {
  const [usr, dom] = req.query.resource.match(/acct:(.*)@(.*)/); // TODO: sanitize
  if (
    dom === baseUrl.domain && // TODO: correct domain check
    (page = await db.Page.findOne({ where: { slug: usr } }))
  ) {
    res.json(page.webfingerJson(baseUrl));
  } else {
    res.status(404);
    next();
  }
});

export default pageRouter;
