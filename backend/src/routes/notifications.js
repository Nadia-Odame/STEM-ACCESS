const express = require("express");
const { Notification } = require("../models");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

// FR8 Notifications — deadline reminders and system notifications.
router.get("/", requireAuth, async (req, res, next) => {
  try {
    const notifications = await Notification.findAll({
      where: { userId: req.user.id },
      order: [["createdAt", "DESC"]],
    });
    res.json({ notifications });
  } catch (err) {
    next(err);
  }
});

router.put("/:id/read", requireAuth, async (req, res, next) => {
  try {
    const notification = await Notification.findOne({ where: { id: req.params.id, userId: req.user.id } });
    if (!notification) return res.status(404).json({ error: "Notification not found." });
    notification.isRead = true;
    await notification.save();
    res.json({ notification });
  } catch (err) {
    next(err);
  }
});

router.put("/read-all", requireAuth, async (req, res, next) => {
  try {
    await Notification.update({ isRead: true }, { where: { userId: req.user.id, isRead: false } });
    res.json({ message: "All notifications marked as read." });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
