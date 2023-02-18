import express from "express";
import db from "../models";

const wellknownRouter = express.Router();

// The 'acct' URI Scheme https://www.rfc-editor.org/rfc/rfc7565
// WebFinger https://www.rfc-editor.org/rfc/rfc7033
// https://domain.example/.well-known/webfinger?resource=acct:user@domain.example
// TODO: support more than just acct URIs
wellknownRouter.get("/webfinger", async function (req, res) {
  console.log("webfinger", req.query.resource);
  const [acct, usr, dom] = req.query.resource.match(/acct:(.*)@(.*)/);
  let page;
  if (
    acct && // TODO: validate protocol fragment?
    dom === req.hostname && // TODO: better domain validation
    (page = await db.Page.findOne({ where: { slug: usr } }))
  )
    res.json({
      subject: `acct:${page.slug}@${req.hostname}`,
      aliases: [page.url],
      links: [
        {
          rel: "http://webfinger.net/rel/profile-page",
          type: "text/html",
          href: page.url,
        },
        {
          rel: "self",
          type: "application/activity+json",
          href: page.actorId,
        },
        //{ rel: "http://ostatus.org/schema/1.0/subscribe", template: ostatusSubscribe, }, // seems unnecessary
      ],
    });
  else res.status(404).json({ message: "Not a local user" });
});

export default wellknownRouter;
