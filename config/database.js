import "dotenv/config";
import path from "path";

const dialect = "sqlite";

const storage = {
  development: path.resolve(
    process.env.PERSISTENT_STORAGE,
    process.env.SQLITE_DB
  ),
  production: path.resolve(
    process.env.PERSISTENT_STORAGE,
    process.env.SQLITE_DB
  ),
  testing: ":memory:",
}[process.env.NODE_ENV];

export { dialect, storage };
