const auth = process.env.PHOTO_ADMIN
  ? {
      users: { admin: process.env.PHOTO_ADMIN },
      challenge: true,
    }
  : undefined;

export default auth;
