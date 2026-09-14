const express = require("express");
const { User, Profile, MentorshipRequest, Message, Notification } = require("../models");
const { requireAuth, requireRole } = require("../middleware/auth");

const router = express.Router();

// FR5.1 Mentor Matching — list approved mentors, optionally ranked by
// overlap with the requesting student's interests/career goal.
router.get("/", requireAuth, async (req, res, next) => {
  try {
    const mentors = await User.findAll({
      where: { role: "mentor", isApproved: true, isSuspended: false },
      include: [{ model: Profile }],
    });

    let profile = null;
    if (req.user.role === "student") {
      profile = await Profile.findOne({ where: { userId: req.user.id } });
    }

    const ranked = mentors
      .map((m) => {
        const mp = m.Profile;
        let overlap = 0;
        if (profile && mp) {
          const studentTerms = new Set(
            [...(profile.skills || []), ...(profile.interests || []), profile.careerGoal || ""].map((s) =>
              String(s).toLowerCase()
            )
          );
          for (const e of mp.expertise || []) {
            if (studentTerms.has(String(e).toLowerCase())) overlap += 1;
          }
        }
        return { id: m.id, name: m.name, email: m.email, profile: mp, matchScore: overlap };
      })
      .sort((a, b) => b.matchScore - a.matchScore);

    res.json({ mentors: ranked });
  } catch (err) {
    next(err);
  }
});

// FR5.2 Mentorship Requests — student requests a mentor
router.post("/:mentorId/request", requireAuth, requireRole("student"), async (req, res, next) => {
  try {
    const mentor = await User.findOne({ where: { id: req.params.mentorId, role: "mentor" } });
    if (!mentor) return res.status(404).json({ error: "Mentor not found." });

    const request = await MentorshipRequest.create({
      studentId: req.user.id,
      mentorId: mentor.id,
      message: req.body.message || "",
      status: "pending",
    });

    await Notification.create({
      userId: mentor.id,
      type: "mentorship",
      message: "You have a new mentorship request.",
    });

    res.status(201).json({ request });
  } catch (err) {
    next(err);
  }
});

// Mentor accepts/declines a request
router.put("/requests/:requestId", requireAuth, requireRole("mentor"), async (req, res, next) => {
  try {
    const { status } = req.body; // "accepted" | "declined"
    if (!["accepted", "declined"].includes(status)) {
      return res.status(400).json({ error: 'status must be "accepted" or "declined".' });
    }
    const request = await MentorshipRequest.findByPk(req.params.requestId);
    if (!request || request.mentorId !== req.user.id) {
      return res.status(404).json({ error: "Mentorship request not found." });
    }
    request.status = status;
    await request.save();

    await Notification.create({
      userId: request.studentId,
      type: "mentorship",
      message: `Your mentorship request was ${status}.`,
    });

    res.json({ request });
  } catch (err) {
    next(err);
  }
});

// List my mentorship requests (as student or mentor)
router.get("/requests/mine", requireAuth, async (req, res, next) => {
  try {
    const where = req.user.role === "mentor" ? { mentorId: req.user.id } : { studentId: req.user.id };
    const requests = await MentorshipRequest.findAll({
      where,
      include: [
        { model: User, as: "student", attributes: ["id", "name", "email"] },
        { model: User, as: "mentor", attributes: ["id", "name", "email"] },
      ],
      order: [["createdAt", "DESC"]],
    });
    res.json({ requests });
  } catch (err) {
    next(err);
  }
});

// FR5.3 Messaging — send/list messages within an accepted mentorship thread
router.post("/requests/:requestId/messages", requireAuth, async (req, res, next) => {
  try {
    const request = await MentorshipRequest.findByPk(req.params.requestId);
    if (!request) return res.status(404).json({ error: "Mentorship thread not found." });
    if (![request.studentId, request.mentorId].includes(req.user.id)) {
      return res.status(403).json({ error: "You are not part of this mentorship thread." });
    }
    if (request.status !== "accepted") {
      return res.status(400).json({ error: "Messaging is only available once the mentorship request is accepted." });
    }
    const { body } = req.body;
    if (!body) return res.status(400).json({ error: "Message body is required." });

    const message = await Message.create({ mentorshipRequestId: request.id, senderId: req.user.id, body });
    res.status(201).json({ message });
  } catch (err) {
    next(err);
  }
});

router.get("/requests/:requestId/messages", requireAuth, async (req, res, next) => {
  try {
    const request = await MentorshipRequest.findByPk(req.params.requestId);
    if (!request) return res.status(404).json({ error: "Mentorship thread not found." });
    if (![request.studentId, request.mentorId].includes(req.user.id)) {
      return res.status(403).json({ error: "You are not part of this mentorship thread." });
    }
    const messages = await Message.findAll({
      where: { mentorshipRequestId: request.id },
      order: [["createdAt", "ASC"]],
    });
    res.json({ messages });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
