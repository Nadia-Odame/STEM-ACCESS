const express = require("express");
const { User, Opportunity, Application, MentorshipRequest, Notification } = require("../models");
const { requireAuth, requireRole } = require("../middleware/auth");

const router = express.Router();

router.use(requireAuth, requireRole("administrator"));

// FR9.2 User Account Management
router.get("/users", async (req, res, next) => {
  try {
    const users = await User.findAll({ order: [["createdAt", "DESC"]] });
    res.json({
      users: users.map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        isApproved: u.isApproved,
        isSuspended: u.isSuspended,
        createdAt: u.createdAt,
      })),
    });
  } catch (err) {
    next(err);
  }
});

router.put("/users/:id", async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found." });

    const { isApproved, isSuspended } = req.body;
    const approvedJustNow = isApproved === true && user.isApproved === false;
    if (isApproved !== undefined) user.isApproved = isApproved;
    if (isSuspended !== undefined) user.isSuspended = isSuspended;
    await user.save();

    if (approvedJustNow) {
      await Notification.create({
        userId: user.id,
        type: "system",
        message: "Your account has been approved by an administrator.",
      });
    }

    res.json({ user });
  } catch (err) {
    next(err);
  }
});

router.delete("/users/:id", async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found." });
    await user.destroy();
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

// FR9.1 Opportunity Approval Workflow
router.get("/opportunities/pending", async (req, res, next) => {
  try {
    const opportunities = await Opportunity.findAll({
      where: { status: "pending_approval" },
      order: [["createdAt", "ASC"]],
    });
    res.json({ opportunities });
  } catch (err) {
    next(err);
  }
});

router.put("/opportunities/:id/status", async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({ error: 'status must be "approved" or "rejected".' });
    }
    const opportunity = await Opportunity.findByPk(req.params.id);
    if (!opportunity) return res.status(404).json({ error: "Opportunity not found." });

    opportunity.status = status;
    await opportunity.save();

    if (opportunity.createdById) {
      await Notification.create({
        userId: opportunity.createdById,
        type: "opportunity",
        message: `Your submitted opportunity "${opportunity.title}" was ${status}.`,
      });
    }

    res.json({ opportunity });
  } catch (err) {
    next(err);
  }
});

// FR9.3 Reports & Analytics
router.get("/reports", async (req, res, next) => {
  try {
    const [totalUsers, students, mentors, partners, approvedOpportunities, pendingOpportunities, totalApplications, acceptedMentorships] =
      await Promise.all([
        User.count(),
        User.count({ where: { role: "student" } }),
        User.count({ where: { role: "mentor" } }),
        User.count({ where: { role: "partner_organization" } }),
        Opportunity.count({ where: { status: "approved" } }),
        Opportunity.count({ where: { status: "pending_approval" } }),
        Application.count(),
        MentorshipRequest.count({ where: { status: "accepted" } }),
      ]);

    res.json({
      users: { total: totalUsers, students, mentors, partners },
      opportunities: { approved: approvedOpportunities, pending: pendingOpportunities },
      applications: { total: totalApplications },
      mentorship: { accepted: acceptedMentorships },
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
