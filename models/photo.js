export default (db, DataTypes) => {
  const Photo = db.define("Photo", {
    caption: { type: DataTypes.TEXT },
    title: { type: DataTypes.TEXT },
  });

  Photo.associate = (models) => {
    Photo.belongsTo(models.Gallery, {
      foreignKey: { allowNull: true },
    });
    Photo.belongsTo(models.Page, {
      foreignKey: { allowNull: true },
    });
  };

  return Photo;
};
