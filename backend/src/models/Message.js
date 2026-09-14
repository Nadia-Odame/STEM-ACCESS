const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

// Implements FR5.3 (Messaging) — secure communication between a mentor
// and mentee, scoped to an accepted MentorshipRequest thread.
const Message = sequelize.define(
  "Message",
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    body: { type: DataTypes.TEXT, allowNull: false },
  },
  { tableName: "messages", timestamps: true }
);

module.exports = Message;
