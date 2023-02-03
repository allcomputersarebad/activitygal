/*
{"@context": "https://www.w3.org/ns/activitystreams",
 "type": "Note",
 "to": ["https://chatty.example/ben/"],
 "attributedTo": "https://social.example/alyssa/",
 "content": "Say, did you finish reading that book I lent you?"}
*/

/*
		{
			"id": "https://domain/users/_/statuses/:status_id/activity",
			"type": "Create",
			"actor": "https://domain/users/_",
			"published": "2023-02-02T18:14:29Z",
			"to": [
				"https://domain/users/_/followers"
			],
			"cc": [
				"https://www.w3.org/ns/activitystreams#Public",
				"https://other.domain/users/otheruser"
			],
			"object": {
				"id": "https://domain/users/_/statuses/:status_id",
				"type": "Note",
				"summary": null,
				"published": "2023-02-02T18:14:29Z",
				"url": "https://domain/@_/:status_id",
				"attributedTo": "https://domain/users/_",
				"to": [
					"https://domain/users/_/followers"
				],
				"cc": [
					"https://www.w3.org/ns/activitystreams#Public",
					"https://other.domain/users/otheruser"
				],
				"sensitive": false,
				"atomUri": "https://domain/users/_/statuses/:status_id",
				"attachment": [],
				"tag": [  // unnecessary
					{
						"type": "Mention",
						"href": "https://other.domain/users/name",
						"name": "@name@other.domain"
					}
				],
				"replies": {
					"id": "https://domain/users/_/statuses/:status_id/replies",
					"type": "Collection",
					"first": {
						"type": "CollectionPage",
						"next": "https://domain/users/_/statuses/:status_id/replies?only_other_accounts=true&page=true",
						"partOf": "https://domain/users/_/statuses/:status_id/replies",
						"items": []
					}
				}
			}
		},
    */

// TODO: ondelete: emit delete action and associate

export default (db, DataTypes) => {
  const APNote = db.define("APNote", {
    paranoid: true,
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, isUUID: 4 },
    content: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    path: {
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

  APNote.associate = (models) => {
    APNote.belongsTo(models.Gallery, { foreignKey: "galleryId" });
    APNote.belongsTo(models.APActor, { foreignKey: "actorId" });
    APNote.hasMany(models.APAttachment, { foreignKey: "noteId" });
  };

  return APNote;
};
