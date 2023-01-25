import basicAuth from "express-basic-auth";

const adminAuth = process.env.PHOTO_ADMIN
  ? basicAuth({
      users: { admin: process.env.PHOTO_ADMIN },
      challenge: true,
    })
  : false;

export default adminAuth;
