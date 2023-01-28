import express from "express";
import db from "../models";
import uploadParser from "../upload";

import fs from "fs/promises";
import path from "path";

const fsRoot = process.env.PERSISTENT_STORAGE;

const adminRouter = express.Router();

adminRouter.get("/", (req, res) => {
  console.log("admin root", req.auth);
  db.Gallery.findAll({
    attributes: ["slug", "name"],
  }).then((allGalleries) =>
    res.render("admin", {
      title: "Admin " + req.auth.user,
      // TODO: is this map necessary?
      galleries: allGalleries.map((g) => g.dataValues),
    })
  );
});

/* TODO:
 * prevent rename clobber
 * multiple galleries per photo? here or elsewhere?
 */
adminRouter.post(
  "/photo",
  express.json(),
  uploadParser.array("photos"),
  (req, res) => {
    const [photos, gallerySlug] = [req.files, req.body.gallery];
    db.Gallery.findOne({
      where: { slug: gallerySlug },
    }).then((toGallery) => {
      const galleryPath = path.join(fsRoot, "gallery", gallerySlug);
      // mkdir recursive because directory may already exist
      fs.mkdir(galleryPath, { recursive: true }).then(() => {
        photos.forEach((photo) => {
          const newPath = path.join(galleryPath, photo.originalname);
          fs.rename(photo.path, newPath).then(() =>
            toGallery.createPhoto({
              path: path.relative(fsRoot, newPath),
            })
          );
        });
      });
      if (req.accepts("html")) {
        res.redirect(path.join("/gallery/", toGallery.slug));
      } else if (req.accepts("json")) {
        res.json(toGallery);
      }
    });
    //res.redirect("/admin");
  }
);

// TODO: paginate
adminRouter.get("/gallery", (req, res) => {
  db.Gallery.findAll().then((allGalleries) => res.json(allGalleries));
});

// TODO: sanitize req.body
adminRouter.post("/gallery", express.json(), express.urlencoded(), (req, res) =>
  db.Gallery.create(req.body).then((newGallery) => res.json(newGallery))
);

export default adminRouter;
