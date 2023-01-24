import path from "path";

const dbPath = process.env.SQLITE_DB
  ? path.resolve(__dirname, process.env.SQLITE_DB)
  : ":memory:";

export default {
  auth: process.env.PHOTO_ADMIN
    ? {
        users: { admin: process.env.PHOTO_ADMIN },
        challenge: true,
      }
    : false,
  database: {
    dialect: "sqlite",
    storage: dbPath,
  },
};
