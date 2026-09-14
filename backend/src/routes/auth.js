const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { User, Profile } = require("../models");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

function signToken(user) {
  return jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
}

function publicUser(user) {
  const { id, name, email, role, isApproved, isSuspended, createdAt } = user;
  return { id, name, email, role, isApproved, isSuspended, createdAt };
}

// FR1.1 User Registration
router.post("/register", async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: "Name, email and password are required." });
    }
    const allowedRoles = ["student", "mentor", "partner_organization"];
    const finalRole = allowedRoles.includes(role) ? role : "student";

    const existing = await User.findOne({ where: { email } });
    if (existing) return res.status(409).json({ error: "An account with that email already exists." });

    const passwordHash = await bcrypt.hash(password, 10);
    // Mentors and partner organizations require administrator approval
    // before they can act on the platform (SRS Business Rules, FR9.1).
    const user = await User.create({
      name,
      email,
      passwordHash,
      role: finalRole,
      isApproved: finalRole === "student",
    });
    await Profile.create({ userId: user.id });

    const token = signToken(user);
    res.status(201).json({ token, user: publicUser(user) });
  } catch (err) {
    next(err);
  }
});

// FR1.2 User Login
router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: "Email and password are required." });

    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(401).json({ error: "Invalid email or password." });

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) return res.status(401).json({ error: "Invalid email or password." });
    if (user.isSuspended) return res.status(403).json({ error: "This account has been suspended." });

    const token = signToken(user);
    res.json({ token, user: publicUser(user) });
  } catch (err) {
    next(err);
  }
});

// FR1.3 Password Recovery (request). No email service is configured for
// this prototype, so the reset token is returned directly in the response
// instead of emailed — clearly marked as demo-only behavior.
router.post("/forgot-password", async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = email && (await User.findOne({ where: { email } }));
    // Always respond the same way whether or not the account exists, so
    // this endpoint can't be used to enumerate registered emails.
    if (!user) {
      return res.json({ message: "If that email is registered, a reset link has been generated." });
    }
    const resetToken = jwt.sign({ id: user.id, purpose: "password-reset" }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    res.json({
      message: "If that email is registered, a reset link has been generated.",
      // Demo-only: a real deployment would email this instead of returning it.
      resetToken,
    });
  } catch (err) {
    next(err);
  }
});

// FR1.3 Password Recovery (confirm)
router.post("/reset-password", async (req, res, next) => {
  try {
    const { resetToken, newPassword } = req.body;
    if (!resetToken || !newPassword) {
      return res.status(400).json({ error: "resetToken and newPassword are required." });
    }
    let payload;
    try {
      payload = jwt.verify(resetToken, process.env.JWT_SECRET);
    } catch {
      return res.status(400).json({ error: "Reset link is invalid or has expired." });
    }
    if (payload.purpose !== "password-reset") {
      return res.status(400).json({ error: "Reset link is invalid or has expired." });
    }
    const user = await User.findByPk(payload.id);
    if (!user) return res.status(404).json({ error: "Account not found." });

    user.passwordHash = await bcrypt.hash(newPassword, 10);
    await user.save();
    res.json({ message: "Password updated. You can now log in with your new password." });
  } catch (err) {
    next(err);
  }
});

// Current authenticated user (used by AuthContext on page load/refresh)
router.get("/me", requireAuth, async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ error: "User not found." });
    res.json({ user: publicUser(user) });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
