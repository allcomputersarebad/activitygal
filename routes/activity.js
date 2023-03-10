import express from "express";
import db from "../models";
import { Actor, webfinger } from "../activity";

const activityRouter = express.Router();

// The 'acct' URI Scheme https://www.rfc-editor.org/rfc/rfc7565
// WebFinger https://www.rfc-editor.org/rfc/rfc7033
// https://domain.example/.well-known/webfinger?resource=acct:user@domain.example
// TODO: support more than just acct URIs
activityRouter.get("/.well-known/webfinger", async function (req, res, next) {
  console.log("webfinger", req.query.resource);
  const [acct, usr, dom] = req.query.resource.match(/acct:(.*)@(.*)/);
  let page;
  if (
    acct &&
    dom === req.hostname && // TODO: correct domain check
    (page = await db.Page.findOne({ where: { slug: usr } }))
  ) {
    res.json(webfinger(new Actor(page)));
  } else {
    res.status(404);
    next();
  }
});

// https://domain.example/authorize_interaction?url=acct:user@otherdomain.example
activityRouter.get("/authorize_interaction", async (req, res, next) => {
  console.log("authorize_interaction", req.query.resource);
  const [_, usr, dom] = req.query.resource.match(/acct:(.*)@(.*)/); // TODO: sanitize
  // TODO
  res.status(404);
  next();
});

export default activityRouter;
