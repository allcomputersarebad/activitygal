import "dotenv/config";
import path from "path";
import fs from "fs";

const photoDir = path.join(
  process.env.PERSISTENT_STORAGE ?? path.resolve(__dirname, ".."),
  "photo"
);
fs.mkdirSync(photoDir, { recursive: true });

const publicDir = path.resolve(__dirname, "..", "public");

export { photoDir, publicDir };
