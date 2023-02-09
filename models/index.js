import fs from "fs";
import path from "path";
import { Sequelize } from "sequelize";
import database from "../config/database";

const db = {};

let sequelize = new Sequelize(database?.uri ?? database);

fs.readdirSync(__dirname)
  .filter(
    (file) =>
      path.extname(file) === ".js" &&
      path.basename(file) !== path.basename(__filename)
  )
  .forEach((file) => {
    const model = require(path.join(__dirname, file)).default(
      sequelize,
      Sequelize.DataTypes
    );
    db[model.name] = model;
  });

Object.keys(db).forEach((modelName) => db[modelName]?.associate(db));

db.sequelize = sequelize;
db.Sequelize = Sequelize;

export default db;
