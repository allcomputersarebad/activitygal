export default (db, DataTypes) => {
  const RemoteDomain = db.define("RemoteDomain", {
    paranoid: true, // really shouldn't ever be deleted
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
  });

  RemoteDomain.associate = (models) => {
    RemoteDomain.hasMany(models.RemoteUser);
  };

  return RemoteDomain;
};
