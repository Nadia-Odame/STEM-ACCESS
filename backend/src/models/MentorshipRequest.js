const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

// Implements FR5.1/FR5.2 (Mentor Matching, Mentorship Requests).
const MentorshipRequest = sequelize.define(
  "MentorshipRequest",
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    message: { type: DataTypes.TEXT, defaultValue: "" },
    status: {
      type: DataTypes.ENUM("pending", "accepted", "declined"),
      allowNull: false,
      defaultValue: "pending",
    },
  },
  { tableName: "mentorship_requests", timestamps: true }
);

module.exports = MentorshipRequest;
