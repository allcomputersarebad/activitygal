import express from "express";
import multer from "multer";

const upload = multer({ dest: "uploads/" });
const adminRouter = express.Router();

adminRouter.get("/", function (req, res, next) {
  console.log("admin root", req.auth);
  res.render("admin", { title: "Admin " + req.auth.user, auth: req.auth });
});

adminRouter.post("/upload", upload.single("photo"), function (req, res, next) {
  console.log("recieving upload");
  console.log("file", req.file);
  res.redirect("/" + req.file.path);
});

export default adminRouter;
