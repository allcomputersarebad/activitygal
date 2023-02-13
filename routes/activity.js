import express from "express";
import db from "../models";

const activityRouter = express.Router();

// The 'acct' URI Scheme https://www.rfc-editor.org/rfc/rfc7565
// WebFinger https://www.rfc-editor.org/rfc/rfc7033
// https://domain.example/.well-known/webfinger?resource=acct:user@domain.example
activityRouter.get("/.well-known/webfinger", async function (req, res, next) {
  console.log("webfinger", req.query.resource);
  const [acct, usr, dom] = req.query.resource.match(/acct:(.*)@(.*)/);
  let page;
  if (
    acct &&
    dom === req.settings.publicHost && // TODO: correct domain check
    (page = await db.Page.findOne({ where: { slug: usr } }))
  ) {
    res.json(page.webfinger());
  } else {
    res.status(404);
    next();
  }
});

export default activityRouter;
