const { Sequelize } = require("sequelize");
require("dotenv").config();

const useSSL = String(process.env.DATABASE_SSL).toLowerCase() === "true";

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: "postgres",
  logging: false,
  dialectOptions: useSSL
    ? { ssl: { require: true, rejectUnauthorized: false } }
    : {},
});

module.exports = sequelize;
