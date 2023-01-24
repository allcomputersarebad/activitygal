export default {
  auth: process.env.PHOTO_ADMIN
    ? {
        users: { admin: process.env.PHOTO_ADMIN },
        challenge: true,
      }
    : false,
  database: process.env.SQLITE_DB
    ? {
        dialect: "sqlite",
        storage: process.env.SQLITE_DB,
      }
    : { dialect: "sqlite" },
};
