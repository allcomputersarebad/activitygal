import "dotenv/config";
import path from "path";

const database = {
  production: {
    dialect: "postgres",
    uri: process.env.DB_URI,
  },
  test: {
    dialect: "sqlite",
    storage: ":memory:",
  },
  development: {
    dialect: "sqlite",
    storage: path.resolve(
      // undefined ?? "" to prevent err
      process.env.PERSISTENT_STORAGE ?? "",
      process.env.DB_FILE ?? "dev.sqlite"
    ),
  },
}[process.env.NODE_ENV];

export default database;
