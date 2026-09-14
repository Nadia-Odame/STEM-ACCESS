const express = require("express");
const { User, Profile } = require("../models");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

// FR2.1/FR2.2 User Profile Management — view and edit personal, academic
// and professional profile fields.
router.get("/", requireAuth, async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ error: "User not found." });

    let profile = await Profile.findOne({ where: { userId: user.id } });
    if (!profile) profile = await Profile.create({ userId: user.id });

    res.json({ profile, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    next(err);
  }
});

router.put("/", requireAuth, async (req, res, next) => {
  try {
    const { name, education, country, skills, interests, careerGoal, bio, expertise, company } = req.body;

    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ error: "User not found." });
    if (typeof name === "string" && name.trim()) {
      user.name = name.trim();
      await user.save();
    }

    let profile = await Profile.findOne({ where: { userId: user.id } });
    if (!profile) profile = await Profile.build({ userId: user.id });

    if (education !== undefined) profile.education = education;
    if (country !== undefined) profile.country = country;
    if (Array.isArray(skills)) profile.skills = skills;
    if (Array.isArray(interests)) profile.interests = interests;
    if (careerGoal !== undefined) profile.careerGoal = careerGoal;
    if (bio !== undefined) profile.bio = bio;
    if (Array.isArray(expertise)) profile.expertise = expertise;
    if (company !== undefined) profile.company = company;
    await profile.save();

    res.json({ profile, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
