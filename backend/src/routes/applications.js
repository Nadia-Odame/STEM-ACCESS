const express = require("express");
const { Application, Opportunity } = require("../models");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

// FR6.1 Career and Application Tracking — every opportunity the user has
// saved, applied to, or registered for.
router.get("/", requireAuth, async (req, res, next) => {
  try {
    const applications = await Application.findAll({
      where: { userId: req.user.id },
      include: [{ model: Opportunity }],
      order: [["updatedAt", "DESC"]],
    });
    res.json({ applications });
  } catch (err) {
    next(err);
  }
});

// Dashboard summary counts, shown on the student dashboard (FR6.1).
router.get("/dashboard", requireAuth, async (req, res, next) => {
  try {
    const applications = await Application.findAll({ where: { userId: req.user.id } });
    const counts = { saved: 0, applied: 0, registered: 0, in_review: 0, accepted: 0, rejected: 0 };
    for (const a of applications) {
      if (counts[a.status] !== undefined) counts[a.status] += 1;
    }
    res.json({ totalApplications: applications.length, counts });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
