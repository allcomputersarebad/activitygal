import express from "express";
import db from "../models";
import { URL } from "url";

const baseUrl = new URL(process.env.PROTOCOL + process.env.DOMAIN);
const ostatusRouter = express.Router();

// The 'acct' URI Scheme https://www.rfc-editor.org/rfc/rfc7565
// WebFinger https://www.rfc-editor.org/rfc/rfc7033
// https://domain.example/.well-known/webfinger?resource=acct:user@domain.example
// TODO: support more than just acct URIs
ostatusRouter.get("/.well-known/webfinger", async (req, res, next) => {
  console.log("webfinger", req.query.resource);
  const [acct, usr, dom] = req.query.resource.match(/acct:(.*)@(.*)/);
  if (
    acct &&
    dom === baseUrl.hostname && // TODO: correct domain check
    (page = await db.Page.findOne({ where: { slug: usr } }))
  ) {
    res.json(page.webfingerJson(baseUrl));
  } else {
    res.status(404);
    next();
  }
});

// https://domain.example/authorize_interaction?url=acct:user@otherdomain.example
ostatusRouter.get("/authorize_interaction", async (req, res, next) => {
  console.log("authorize_interaction", req.query.resource);
  const [_, usr, dom] = req.query.resource.match(/acct:(.*)@(.*)/); // TODO: sanitize
  // dom is remote?
  // now what?
  res.status(404);
  next();
});

export default ostatusRouter;
