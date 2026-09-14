const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

// Implements FR8 (Notifications): deadline reminders and general system
// notifications (mentorship updates, new opportunities, announcements).
const Notification = sequelize.define(
  "Notification",
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    type: {
      type: DataTypes.ENUM("deadline", "mentorship", "opportunity", "system"),
      allowNull: false,
      defaultValue: "system",
    },
    message: { type: DataTypes.STRING, allowNull: false },
    isRead: { type: DataTypes.BOOLEAN, defaultValue: false },
  },
  { tableName: "notifications", timestamps: true }
);

module.exports = Notification;
