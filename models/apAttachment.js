/*
// field of a note
"attachment": [
		{
			"type": "Document",
			"mediaType": "image/png",
			"url": """,
			"name": "alt text go here",
			"blurhash": "", // do we need this?
			"focalPoint": [ // don't need this for basic
				0.6,
				1.0
			],
			"width": 412,
			"height": 399
		}
	],
*/
export default (db, DataTypes) => {
  const APAttachment = db.define("APAttachment", {
    paranoid: true, // TODO: ondelete emit delete activity
    name: {
      type: DataTypes.VIRTUAL,
      get() {
        return this.photo.altText;
      },
    },
    url: {
      type: DataTypes.VIRTUAL,
      get() {
        return this.photo.path;
      },
    },
    type: {
      type: DataTypes.VIRTUAL,
      get() {
        return "Document";
      },
    },
    mediaType: {
      type: DataTypes.STRING,
      defaultValue: "image/jpeg",
    },
    width: {
      type: DataTypes.VIRTUAL,
      get() {
        return this.photo.width;
      },
    },
    height: {
      type: DataTypes.VIRTUAL,
      get() {
        return this.photo.height;
      },
    },
  });

  APAttachment.associate = (models) => {
    APAttachment.belongsTo(models.Photo, { foreignKey: "photoId" });
    APAttachment.belongsTo(models.APNote, { foreignKey: "noteId" });
    APAttachment.belongsTo(models.APActor, { foreignKey: "actorId" });
  };

  return APAttachment;
};
