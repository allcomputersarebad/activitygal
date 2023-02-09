import "dotenv/config";
import path from "path";

const database = {
  production: {
    uri: process.env.DB_URI,
    options: {
      dialect: "postgres",
      dialectOptions: {
        ssl: true,
      },
    },
  },
  test: {
    dialect: "sqlite",
    storage:
      process.env.PERSISTENT_STORAGE && process.env.DB_TEST
        ? path.resolve(process.env.PERSISTENT_STORAGE, process.env.DB_TEST)
        : ":memory:",
  },
  development: {
    dialect: "sqlite",
    storage:
      process.env.PERSISTENT_STORAGE && process.env.DB_FILE
        ? path.resolve(process.env.PERSISTENT_STORAGE, process.env.DB_FILE)
        : undefined,
  },
}[process.env.NODE_ENV];

console.log("selected database config", database);

export default database;
