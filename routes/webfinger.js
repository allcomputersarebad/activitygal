import express from "express";
import db from "../models";

const webfingerRouter = express.Router();

// The 'acct' URI Scheme https://www.rfc-editor.org/rfc/rfc7565
// WebFinger https://www.rfc-editor.org/rfc/rfc7033
// https://domain.example/.well-known/webfinger?resource=acct:user@domain.example
// TODO: support more than just acct URIs
webfingerRouter.get("/", async function (req, res, next) {
  console.log("webfinger", req.query.resource);
  const [acct, usr, dom] = req.query.resource.match(/acct:(.*)@(.*)/);
  let page;
  if (
    acct &&
    dom === req.hostname && // TODO: correct domain check
    (page = await db.Page.findOne({ where: { slug: usr } }))
  ) {
    res.json({
      subject: page.acctUri,
      aliases: [page.profileUrl],
      links: [
        {
          rel: "http://webfinger.net/rel/profile-page",
          type: "text/html",
          href: page.profileUrl,
        },
        {
          rel: "self",
          type: "application/activity+json",
          href: page.actorId,
        },
        // seems unnecessary
        //{ rel: "http://ostatus.org/schema/1.0/subscribe", template: ostatusSubscribe, },
      ],
    });
  } else {
    res.status(404);
    next();
  }
});

export default webfingerRouter;
