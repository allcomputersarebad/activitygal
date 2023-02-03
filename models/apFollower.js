export default (db, DataTypes) => {
  const APFollower = db.define("APFollower", {
    paranoid: true,
    webfinger: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    inbox: {
      type: DataTypes.VIRTUAL,
      get() {
        return `/${this.actor}/${this.id}`;
      },
    },
    type: {
      type: DataTypes.VIRTUAL,
      get() {
        return "note";
      },
    },
    attributedTo: {
      type: DataTypes.VIRTUAL,
      get() {
        return `${this.actor.path}`;
      },
    },
  });

  APFollower.associate = (models) => {
    APFollower.belongsTo(models.APActor, { foreignKey: "actorId" });
  };

  return APFollower;
};
