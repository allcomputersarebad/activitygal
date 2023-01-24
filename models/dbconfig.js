const { Sequelize } = require("sequelize");
const persistent_path = process.env.PERSISTENT_STORAGE_DIR || ".";

const sequelize = new Sequelize({
  dialect: "sqlite",
  host: persistent_path + process.env.SQLITE_DB,
});

module.exports = sequelize;
