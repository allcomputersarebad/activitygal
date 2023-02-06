export default (db, DataTypes) => {
  const RemoteUser = db.define("RemoteUser", {
    paranoid: true,
    webfinger: {
      // TODO: all other fields virtual on webfinger data?
      type: DataTypes.STRING,
      allowNull: false,
    },
    user: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    domain: {
      type: DataTypes.VIRTUAL(DataTypes.STRING),
      get() {
        return this.RemoteDomain.name;
      },
    },
    inbox: {
      // URL
      // TODO: must implement request signing to post to mastodon
      type: DataTypes.STRING,
      allowNull: false,
    },
    userBanned: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    lastDelivery: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  });

  RemoteUser.associate = (models) => {
    RemoteUser.belongsTo(models.RemoteDomain);
    RemoteUser.belongsToMany(models.Page, { through: "PageFollowers" });
  };

  return RemoteUser;
};
