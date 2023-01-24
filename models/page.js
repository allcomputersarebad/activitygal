export default (db, DataTypes) => {
  const Page = db.define("Page", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  });

  Page.associate = (models) => {
    Page.hasMany(models.Gallery);
    Page.hasMany(models.Photo);
  };

  return Page;
};
