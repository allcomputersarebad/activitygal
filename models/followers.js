export default (db, DataTypes) => {
  const Followers = db.define(
    "Followers",
    {
      acceptId: {
        primaryKey: true,
        type: DataTypes.BIGINT,
        defaultValue: () => Date.now() * 10 + Math.floor(Math.random() * 10),
      },
      activity: {
        type: DataTypes.JSON,
      },
      signature: {
        type: DataTypes.JSON,
      },
    },
    { paranoid: true }
  );

  Followers.associate = (models) => {};

  return Followers;
};
