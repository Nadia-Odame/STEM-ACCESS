const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

// Implements FR3 (Opportunity Management) and FR7 (Event Management).
// "category" covers Scholarship / Internship / Event (the three
// Opportunity subclasses in Appendix B.2's Class Diagram) plus a general
// "course" type for the Learning Resource Library.
const Opportunity = sequelize.define(
  "Opportunity",
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    title: { type: DataTypes.STRING, allowNull: false },
    category: {
      type: DataTypes.ENUM("scholarship", "internship", "event", "course"),
      allowNull: false,
    },
    description: { type: DataTypes.TEXT, defaultValue: "" },
    organization: { type: DataTypes.STRING, defaultValue: "" },
    country: { type: DataTypes.STRING, defaultValue: "Global" },
    fieldOfStudy: { type: DataTypes.STRING, defaultValue: "" },
    tags: { type: DataTypes.ARRAY(DataTypes.STRING), defaultValue: [] }, // matched against a student's skills/interests for FR4.1
    deadline: { type: DataTypes.DATEONLY, allowNull: true },
    url: { type: DataTypes.STRING, defaultValue: "" },
    status: {
      type: DataTypes.ENUM("pending_approval", "approved", "rejected"),
      allowNull: false,
      defaultValue: "approved",
    },
  },
  { tableName: "opportunities", timestamps: true }
);

module.exports = Opportunity;
