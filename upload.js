import multer from "multer";
import path from "path";

const uploadParser = multer({
  dest: process.env.PERSISTENT_STORAGE
    ? path.resolve(process.env.PERSISTENT_STORAGE, "upload")
    : undefined,
});

export default uploadParser;
