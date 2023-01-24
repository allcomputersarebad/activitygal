import { Sequelize } from "sequelize";

const db = new Sequelize({
  dialect: "sqlite",
  host: process.env.SQLITE_DB,
});

export default db;
