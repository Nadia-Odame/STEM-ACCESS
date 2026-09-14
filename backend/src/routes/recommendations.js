const express = require("express");
const { Profile, Opportunity } = require("../models");
const { requireAuth } = require("../middleware/auth");
const { recommend, skillGapAnalysis, buildLearningRoadmap, enrichWithAI } = require("../services/recommendationEngine");

const router = express.Router();

async function loadStudentContext(req) {
  const profile = await Profile.findOne({ where: { userId: req.user.id } });
  const opportunities = await Opportunity.findAll({ where: { status: "approved" } });
  return { profile, opportunities };
}

// FR4.1 Personalized Recommendations. Only students have a
// skills/interests-driven profile to match against, so other roles simply
// see no recommendations on their dashboard rather than an error.
router.get("/", requireAuth, async (req, res, next) => {
  try {
    if (req.user.role !== "student") return res.json({ recommendations: [] });

    const { profile, opportunities } = await loadStudentContext(req);
    if (!profile) return res.json({ recommendations: [] });

    let recommendations = recommend(profile, opportunities, 10);
    recommendations = await enrichWithAI(profile, recommendations);
    res.json({ recommendations });
  } catch (err) {
    next(err);
  }
});

// FR4.2 Skill Gap Analysis
router.get("/skill-gaps", requireAuth, async (req, res, next) => {
  try {
    if (req.user.role !== "student") return res.json({ gaps: [] });
    const { profile, opportunities } = await loadStudentContext(req);
    if (!profile) return res.json({ gaps: [] });
    res.json({ gaps: skillGapAnalysis(profile, opportunities) });
  } catch (err) {
    next(err);
  }
});

// FR4.3 Learning Roadmap
router.get("/roadmap", requireAuth, async (req, res, next) => {
  try {
    if (req.user.role !== "student") return res.json({ gaps: [], roadmap: [] });
    const { profile, opportunities } = await loadStudentContext(req);
    if (!profile) return res.json({ gaps: [], roadmap: [] });

    const gaps = skillGapAnalysis(profile, opportunities);
    const roadmap = buildLearningRoadmap(profile, gaps);
    res.json({ gaps, roadmap });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
