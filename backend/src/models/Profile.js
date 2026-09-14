const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

// Implements FR2 (User Profile Management). One Profile per Student user,
// matching the 1-to-1 Student–Profile relationship in Appendix B.2.
const Profile = sequelize.define(
  "Profile",
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    education: { type: DataTypes.STRING, defaultValue: "" },
    country: { type: DataTypes.STRING, defaultValue: "" },
    skills: { type: DataTypes.ARRAY(DataTypes.STRING), defaultValue: [] },
    interests: { type: DataTypes.ARRAY(DataTypes.STRING), defaultValue: [] },
    careerGoal: { type: DataTypes.STRING, defaultValue: "" },
    bio: { type: DataTypes.TEXT, defaultValue: "" },
    // Mentor-only fields (used when the owning user's role === "mentor")
    expertise: { type: DataTypes.ARRAY(DataTypes.STRING), defaultValue: [] },
    company: { type: DataTypes.STRING, defaultValue: "" },
  },
  { tableName: "profiles", timestamps: true }
);

module.exports = Profile;
