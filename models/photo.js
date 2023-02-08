import path from "path";

export default (db, DataTypes) => {
  const Photo = db.define("Photo", {
    title: { type: DataTypes.STRING },
    caption: { type: DataTypes.TEXT },
    description: { type: DataTypes.TEXT },
    altText: {
      type: DataTypes.VIRTUAL(DataTypes.STRING, [
        "description",
        "caption",
        "title",
      ]),
      get() {
        return `${this.description || this.caption || this.title}`;
      },
    },
    resource: {
      type: DataTypes.STRING,
      notEmpty: true,
      allowNull: false,
    },
    mediaType: { type: DataTypes.STRING },
    path: {
      type: DataTypes.VIRTUAL(DataTypes.STRING, ["resource"]),
      get() {
        return path.join("/photo/", this.resource);
      },
    },
  });

  Photo.associate = (models) => {
    Photo.belongsTo(models.Gallery);
  };

  return Photo;
};
