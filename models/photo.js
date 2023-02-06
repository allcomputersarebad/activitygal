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

  Photo.attachmentJson = (base) => {
    const photoUrl = new URL(this.path, base);
    return {
      type: "Document",
      mediaType: this.mediaType, // like "image/png",
      url: photoUrl.href,
      name: this.altText,
      //"focalPoint": [ 0.6, 1.0 ], // unnecessary
      //width, height // necessary?
    };
  };

  Photo.associate = (models) => {
    Photo.belongsTo(models.Gallery);
  };

  return Photo;
};
