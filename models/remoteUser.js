export default (db, DataTypes) => {
  const RemoteUser = db.define(
    "RemoteUser",
    {
      actorId: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      // TODO: allow nulls? i could handle this in the inbox router
      actorJson: {
        // TODO: other fields virtual on this?
        type: DataTypes.STRING,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      actorInbox: {
        type: DataTypes.STRING,
      },
      actorBanned: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      inbox: {
        type: DataTypes.VIRTUAL(DataTypes.STRING, ["userInbox", "Domain"]),
        get() {
          return this.actorInbox || this.Domain.sharedInbox;
        },
      },
      banned: {
        type: DataTypes.VIRTUAL(DataTypes.BOOLEAN, ["userBanned", "Domain"]),
        get() {
          return this.actorBanned || this.Domain.domainBanned;
        },
      },
      lastDelivery: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    { paranoid: true }
  );

  RemoteUser.associate = (models) => {
    RemoteUser.belongsTo(models.RemoteDomain, {
      targetKey: "name",
      as: "Domain",
    });
    RemoteUser.belongsToMany(models.Page, {
      through: "Followers",
      as: "Following",
    });
  };

  RemoteUser.addHook("beforeSave", async (remoteUser, options) => {
    if (!remoteUser.banned) {
      // TODO: is it possible to fail banned check on a new user?
      const actorJson = await new Promise((resolve, reject) => {
        let responseData = "";
        const actorRequest = request(
          remoteUser.actorId,
          { headers: { Accept: "application/activity+json" } },
          (response) => {
            response.on("data", (chunk) => {
              responseData += chunk;
            });
            response.on("end", () => {
              resolve(responseData);
            });
          }
        );
        actorRequest.on("error", (err) => {
          reject(err);
        });
        actorRequest.end();
      });
      // TODO: more validation?
      const { inbox, preferredUsername } = actorJson;
      if (inbox && preferredUsername) {
        remoteUser.setDataValue("actorJson", actorJson);
        remoteUser.setDataValue("userInbox", inbox);
        remoteUser.setDataValue("name", preferredUsername);
      }
    }
  });

  RemoteUser.deliverActivity = function (activity, auth) {
    return new Promise((resolve, reject) => {
      let responseData = "";
      const activityPost = request(
        {
          url: this.inbox,
          method: "POST",
          headers: {
            Signature: auth.signature,
            Digest: auth.digest,
            Date: auth.date,
            "Content-Type": "application/activity+json",
            Accept: "application/activity+json",
          },
          body: activity,
          json: true,
        },
        (response) => {
          response.on("data", (chunk) => {
            responseData += chunk;
          });
          response.on("end", () => {
            resolve(responseData);
          });
        }
      );
      activityPost.on("error", (err) => {
        reject(err);
      });
      activityPost.end();
    });
  };

  return RemoteUser;
};
