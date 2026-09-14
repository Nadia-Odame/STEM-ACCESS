const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

// Implements FR1 (Registration/Authentication) and the abstract "User"
// class from Appendix B.2 (Class Diagram) of the SRS. Role distinguishes
// the four actors from the Use Case Diagram: student, mentor,
// partner_organization, administrator.
const User = sequelize.define(
  "User",
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false, unique: true, validate: { isEmail: true } },
    passwordHash: { type: DataTypes.STRING, allowNull: false },
    role: {
      type: DataTypes.ENUM("student", "mentor", "partner_organization", "administrator"),
      allowNull: false,
      defaultValue: "student",
    },
    isApproved: { type: DataTypes.BOOLEAN, defaultValue: true }, // mentors/partner orgs can be gated by an admin (FR9.1)
    isSuspended: { type: DataTypes.BOOLEAN, defaultValue: false },
  },
  { tableName: "users", timestamps: true }
);

module.exports = User;
