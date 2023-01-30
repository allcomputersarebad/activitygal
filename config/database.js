import "dotenv/config";
import path from "path";

const dialect = "sqlite";
const storage = path.resolve(
  process.env.PERSISTENT_STORAGE,
  process.env.SQLITE_DB
);

export { dialect, storage };
