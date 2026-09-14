const { Op } = require("sequelize");
const express = require("express");
const { Opportunity, Application, User } = require("../models");
const { requireAuth, requireRole } = require("../middleware/auth");

const router = express.Router();

// FR3.1/FR3.2 Opportunity Management + FR7 Event Management (events are
// Opportunities with category "event"). Public listing only ever shows
// opportunities an administrator has approved (FR9.1 approval workflow) —
// pending/rejected items are only visible through the admin routes.
router.get("/", async (req, res, next) => {
  try {
    const { q, category } = req.query;
    const where = { status: "approved" };
    if (category) where.category = category;
    if (q) {
      where[Op.or] = [
        { title: { [Op.iLike]: `%${q}%` } },
        { organization: { [Op.iLike]: `%${q}%` } },
        { description: { [Op.iLike]: `%${q}%` } },
        { fieldOfStudy: { [Op.iLike]: `%${q}%` } },
      ];
    }
    const opportunities = await Opportunity.findAll({ where, order: [["createdAt", "DESC"]] });
    res.json({ opportunities });
  } catch (err) {
    next(err);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const opportunity = await Opportunity.findOne({ where: { id: req.params.id, status: "approved" } });
    if (!opportunity) return res.status(404).json({ error: "Opportunity not found." });
    res.json({ opportunity });
  } catch (err) {
    next(err);
  }
});

router.post("/", requireAuth, requireRole("partner_organization", "administrator"), async (req, res, next) => {
  try {
    const { title, category, description, organization, country, fieldOfStudy, tags, deadline, url } = req.body;
    if (!title || !category) return res.status(400).json({ error: "title and category are required." });

    const opportunity = await Opportunity.create({
      title,
      category,
      description,
      organization,
      country,
      fieldOfStudy,
      tags: Array.isArray(tags) ? tags : [],
      deadline: deadline || null,
      url,
      createdById: req.user.id,
      // Administrators publish immediately; partner organizations submit
      // for admin review (FR9.1 Opportunity Approval Workflow).
      status: req.user.role === "administrator" ? "approved" : "pending_approval",
    });
    res.status(201).json({ opportunity });
  } catch (err) {
    next(err);
  }
});

router.put("/:id", requireAuth, requireRole("partner_organization", "administrator"), async (req, res, next) => {
  try {
    const opportunity = await Opportunity.findByPk(req.params.id);
    if (!opportunity) return res.status(404).json({ error: "Opportunity not found." });
    if (req.user.role !== "administrator" && opportunity.createdById !== req.user.id) {
      return res.status(403).json({ error: "You can only edit opportunities you created." });
    }

    const fields = ["title", "category", "description", "organization", "country", "fieldOfStudy", "tags", "deadline", "url"];
    for (const f of fields) {
      if (req.body[f] !== undefined) opportunity[f] = req.body[f];
    }
    await opportunity.save();
    res.json({ opportunity });
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", requireAuth, requireRole("partner_organization", "administrator"), async (req, res, next) => {
  try {
    const opportunity = await Opportunity.findByPk(req.params.id);
    if (!opportunity) return res.status(404).json({ error: "Opportunity not found." });
    if (req.user.role !== "administrator" && opportunity.createdById !== req.user.id) {
      return res.status(403).json({ error: "You can only delete opportunities you created." });
    }
    await opportunity.destroy();
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

// FR3.3 Save Opportunities / FR6.1 Application Tracking / FR7.2 Event
// Registration — record or update the requesting user's action on an
// opportunity (save / apply / register).
router.post("/:id/action", requireAuth, async (req, res, next) => {
  try {
    const { status } = req.body;
    const validStatuses = ["saved", "applied", "registered", "in_review", "accepted", "rejected"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: `status must be one of: ${validStatuses.join(", ")}` });
    }

    const opportunity = await Opportunity.findByPk(req.params.id);
    if (!opportunity) return res.status(404).json({ error: "Opportunity not found." });

    let application = await Application.findOne({ where: { userId: req.user.id, opportunityId: opportunity.id } });
    const isFirstAction = !application;
    if (!application) {
      application = Application.build({ userId: req.user.id, opportunityId: opportunity.id });
    }
    application.status = status;
    if (["applied", "registered"].includes(status) && (isFirstAction || !application.dateApplied)) {
      application.dateApplied = new Date();
    }
    await application.save();

    res.status(isFirstAction ? 201 : 200).json({ application });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
