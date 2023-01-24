import basicAuth from "express-basic-auth";

const auth = basicAuth({
  users: { admin: process.env.PHOTO_ADMIN },
  challenge: true,
});

export default auth;
