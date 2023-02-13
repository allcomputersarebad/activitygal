import multer from "multer";

const uploadParser = multer({
  storage: multer.diskStorage({}),
});

export default uploadParser;
