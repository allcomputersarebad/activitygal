import express from "express";
import db from "../models";
import multer from "multer";

import fs from "fs/promises";
import path from "path";

const fsRoot = process.env.PERSISTENT_STORAGE;
const uploadDir = path.join(fsRoot, "upload");
const upload = multer({ dest: uploadDir });
const adminRouter = express.Router();

adminRouter.get("/", async function (req, res, next) {
  console.log("admin root", req.auth);
  const galleryQuery = await db.Gallery.findAll({
    attributes: ["slug", "name"],
  });
  res.render("admin", {
    title: "Admin " + req.auth.user,
    galleries: galleryQuery.map((g) => g.dataValues),
  });
});

adminRouter.post("/upload", upload.array("photos"), function (req, res, next) {
  const photoUploads = req.files;
  const gallerySlug = req.body.gallery;
  const galleryPath = path.join(fsRoot, "gallery", gallerySlug);
  db.Gallery.findOne({
    where: { slug: gallerySlug },
  }).then((targetGallery) => {
    fs.mkdir(galleryPath, { recursive: true }).then(() => {
      photoUploads.forEach((photo) => {
        const newPath = path.join(galleryPath, photo.originalname);
        fs.rename(photo.path, newPath).then(() =>
          db.Photo.create({
            gallery: targetGallery,
            path: path.relative(fsRoot, newPath),
          })
        );
      });
    });
  });
  res.redirect("/");
});

export default adminRouter;
