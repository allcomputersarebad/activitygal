export default (db, DataTypes) => {
  const RemoteDomain = db.define(
    "RemoteDomain",
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      sharedInbox: {
        // TODO: must implement request signing to post to mastodon
        type: DataTypes.STRING,
        allowNull: false,
      },
      domainBanned: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
    },
    { paranoid: true }
  );

  RemoteDomain.associate = (models) => {
    RemoteDomain.hasMany(models.RemoteUser, {
      targetKey: "actorId",
      as: "Users",
    });
  };

  return RemoteDomain;
};
