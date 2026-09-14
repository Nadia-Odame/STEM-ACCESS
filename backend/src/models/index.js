const sequelize = require("../config/db");
const User = require("./User");
const Profile = require("./Profile");
const Opportunity = require("./Opportunity");
const Application = require("./Application");
const MentorshipRequest = require("./MentorshipRequest");
const Message = require("./Message");
const Notification = require("./Notification");
const Recommendation = require("./Recommendation");

// ---- Associations (mirrors Appendix B.2 Class Diagram relationships) ----

// User (abstract) <-> Profile (1-to-1, Student has exactly one Profile)
User.hasOne(Profile, { foreignKey: "userId", onDelete: "CASCADE" });
Profile.belongsTo(User, { foreignKey: "userId" });

// Opportunity created/published by a partner org or admin
User.hasMany(Opportunity, { foreignKey: "createdById", as: "createdOpportunities" });
Opportunity.belongsTo(User, { foreignKey: "createdById", as: "createdBy" });

// Student <-> Opportunity through Application (many-to-many with extra fields)
User.hasMany(Application, { foreignKey: "userId", onDelete: "CASCADE" });
Application.belongsTo(User, { foreignKey: "userId" });
Opportunity.hasMany(Application, { foreignKey: "opportunityId", onDelete: "CASCADE" });
Application.belongsTo(Opportunity, { foreignKey: "opportunityId" });

// Student <-> Mentor through MentorshipRequest
User.hasMany(MentorshipRequest, { foreignKey: "studentId", as: "sentMentorshipRequests" });
User.hasMany(MentorshipRequest, { foreignKey: "mentorId", as: "receivedMentorshipRequests" });
MentorshipRequest.belongsTo(User, { foreignKey: "studentId", as: "student" });
MentorshipRequest.belongsTo(User, { foreignKey: "mentorId", as: "mentor" });

// Messages belong to a mentorship thread
MentorshipRequest.hasMany(Message, { foreignKey: "mentorshipRequestId", onDelete: "CASCADE" });
Message.belongsTo(MentorshipRequest, { foreignKey: "mentorshipRequestId" });
User.hasMany(Message, { foreignKey: "senderId", as: "sentMessages" });
Message.belongsTo(User, { foreignKey: "senderId", as: "sender" });

// Notifications belong to a user
User.hasMany(Notification, { foreignKey: "userId", onDelete: "CASCADE" });
Notification.belongsTo(User, { foreignKey: "userId" });

// Recommendations link a student to an Opportunity with a score
User.hasMany(Recommendation, { foreignKey: "userId", onDelete: "CASCADE" });
Recommendation.belongsTo(User, { foreignKey: "userId" });
Opportunity.hasMany(Recommendation, { foreignKey: "opportunityId", onDelete: "CASCADE" });
Recommendation.belongsTo(Opportunity, { foreignKey: "opportunityId" });

module.exports = {
  sequelize,
  User,
  Profile,
  Opportunity,
  Application,
  MentorshipRequest,
  Message,
  Notification,
  Recommendation,
};
