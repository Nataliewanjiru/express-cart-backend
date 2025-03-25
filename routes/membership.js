const express = require("express");
const Membership = require("../models/membership"); // Ensure correct path
const router = express.Router();

/* Get all memberships */
router.get("/", async (req, res) => {
  try {
    const memberships = await Membership.find().populate("user group", "name email"); // Populate user and group details
    res.status(200).json(memberships);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* ✅ Get memberships by user */
router.get("/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const memberships = await Membership.find({ user: userId }).populate("group", "name"); // Get groups user belongs to
    res.status(200).json(memberships);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* ✅ Get memberships by group */
router.get("/group/:groupId", async (req, res) => {
  try {
    const { groupId } = req.params;
    const memberships = await Membership.find({ group: groupId }).populate("user", "name email"); // Get users in the group
    res.status(200).json(memberships);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* ✅ Get a single user's membership in a group */
router.get("/:groupId/:userId", async (req, res) => {
  try {
    const { groupId, userId } = req.params;
    const membership = await Membership.findOne({ group: groupId, user: userId });

    if (!membership) return res.status(404).json({ message: "Membership not found" });

    res.status(200).json(membership);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
