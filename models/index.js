import fs from "fs";
import path from "path";
import { Sequelize } from "sequelize";
import * as database from "../config/database";
console.log("loaded config", database);

const basename = path.basename(__filename);

const db = {};

let sequelize = new Sequelize(database);

fs.readdirSync(__dirname)
  .filter(
    (file) =>
      file.indexOf(".") !== 0 && file !== basename && file.slice(-3) === ".js"
  )
  .forEach((file) => {
    const model = require(path.join(__dirname, file)).default(
      sequelize,
      Sequelize.DataTypes
    );
    db[model.name] = model;
  });

Object.keys(db).forEach((modelName) => {
  console.log("associating", modelName);
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

export default db;
