import express from "express";
import db from "../models";
import multer from "multer";

import fs from "fs/promises";

const upload = multer();
const adminRouter = express.Router();

adminRouter.get("/", async function (req, res, next) {
  console.log("admin root", req.auth);
  const galleryQuery = await db.Gallery.findAll({
    attributes: ["slug", "name"],
  });
  const galleryData = galleryQuery.map((g) => g.dataValues);
  console.log("data galleries", galleryData);
  res.render("admin", {
    title: "Admin " + req.auth.user,
    galleries: galleryData,
  });
});

adminRouter.post(
  "/upload",
  upload.array("photos"),
  async function (req, res, next) {
    console.log("upload for gallery", targetGallery);
    const gallerySlug = req.body.gallery;
    const targetGallery = await db.Gallery.findOne({
      where: { slug: gallerySlug },
    });
    //const renamed = await fs.rename(
    //db.Photo.create({gallery: targetGallery})
  }
);

export default adminRouter;
