export default (db, DataTypes) => {
  const Gallery = db.define("Gallery", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
    },
  });

  Gallery.associate = (models) => {
    Gallery.hasMany(models.Photo, {
      onDelete: "cascade",
    });
  };

  return Gallery;
};
