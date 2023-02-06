import express from "express";
import db from "../models";

const galleriesRouter = express.Router();

/* GET galleries page. */
galleriesRouter.get("/", async function (req, res, next) {
  const allGalleries = await db.Gallery.findAll({
    include: [db.title, db.slug],
  });
  res.render("galleries", {
    title: "Galleries",
    galleries: allGalleries,
  });
});

export default galleriesRouter;
// galleryRouter.get("/:slug", function (req, res, next) {
//   console.log("rendering gallery", req.gallery);
//   if (!req.gallery || req.gallery?.hidden) {
//     // res.sendStatus(404);
//     res.status(404);
//     next();
//   } else {
//     if (req.accepts("html")) {
//       res.render("gallery", {
//         title: req.gallery.title,
//         gallery: req.gallery,
//         photos: req.gallery?.Photos.map(
//           ({ altText, caption, description, path, title, uuid }) => ({
//             altText,
//             caption,
//             description,
//             path,
//             title,
//             uuid,
//           })
//         ),
//       });
//     } else if (req.accepts("json")) {
//       // TODO: restrict outgoing fields
//       res.json(req.gallery);
//     }
//   }
// });
