const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

// Implements FR3.3 (Save Opportunities), FR6.1 (Application Tracking) and
// FR7.2 (Event Registration). "saved" = bookmarked only, "applied"/
// "registered" = the user has taken action, remaining fields track status.
const Application = sequelize.define(
  "Application",
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    status: {
      type: DataTypes.ENUM("saved", "applied", "registered", "in_review", "accepted", "rejected"),
      allowNull: false,
      defaultValue: "saved",
    },
    dateApplied: { type: DataTypes.DATE, allowNull: true },
  },
  { tableName: "applications", timestamps: true }
);

module.exports = Application;
