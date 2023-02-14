import express from "express";
import db from "../models";
import { URL } from "url";

const inboxRouter = express.Router();

const base = new URL(
  `${process.env.EXTERNAL_PROTOCOL ?? "http"}://${
    process.env.EXTERNAL_HOST ?? "localhost:3000"
  }`
);

inboxRouter.post("/", express.json(), async (req, res) => {
  console.log("inbox recieved", req.body);
  const { actor, type, object } = req.body;
  const remoteActor = actor ? new URL(actor) : false;
  if (!actor || !remoteActor || req.hostname !== remoteActor?.hostname)
    return res.sendStatus(400, { error: "Invalid origin actor" });
  const knownRemoteDomain = db.RemoteDomain.findOrCreate({
    where: { name: remoteActor.hostname },
  });
  if (knownRemoteDomain.domainBanned) {
    // just drop
    req.socket.destroy();
    res.socket.destroy();
  }

  // should only reach this if origin domain is reasonable
  // findOrCreate grabs actor json from remote server
  const knownRemoteUser = await db.RemoteUsers.findOrCreate({
    where: { actorId: remoteActor.href, Domain: knownRemoteDomain },
  });

  if (knownRemoteUser.userBanned)
    return res.sendStatus(403, { error: "Origin actor banned" });

  const localUserUrl = new URL(object);
  const localTarget =
    localUserUrl.hostname === base.hostname &&
    (await db.Page.findOne({
      where: { path: localUserUrl.pathname },
    }));
  if (!localTarget)
    return res.sendStatus(404).json({ error: "Not a local user" });

  console.log(
    "inbox",
    type,
    "recieved for",
    localTarget.title,
    knownRemoteUser.actorId
  );

  // TODO: handle other activities
  if (type === "Follow") {
    const followed = await localTarget.addFollower(knownRemoteUser);
    followed.activity = req.body;

    // generate accept activity
    const acceptActivity = {
      "@context": [
        "https://www.w3.org/ns/activitystreams",
        "https://w3id.org/security/v1",
      ],
      type: "Accept",
      // a unique id for this Accept activity
      // TODO: currently ephemeral. does this route need to actually resolve?
      id: new URL(base, followed.acceptId),
      actor: localTarget.actorId,
      // the follow activity
      object: req.body,
    };

    // sign the activity
    const activitySig = localTarget.signActivity(
      acceptActivity,
      knownRemoteUser.inbox
    );

    const delivery = await knownRemoteUser.deliverActivity(
      acceptActivity,
      activitySig
    );

    if (acceptSent) {
      followed.activity = acceptActivity;
      followed.signature = activitySig;
      res.json({ success: "Follow accepted" });
    } else
      res.sendStatus(500).json({ error: "Failed to accept follow", delivery });
  }
});

export default inboxRouter;
