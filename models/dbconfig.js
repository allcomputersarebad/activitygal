import { Sequelize } from "sequelize";

const sequelize = new Sequelize({
  dialect: "sqlite",
  host: process.env.SQLITE_DB,
});

module.exports = sequelize;
