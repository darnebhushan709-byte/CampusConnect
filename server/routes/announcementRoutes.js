const express = require("express");
const router = express.Router();
const Announcement = require("../models/Announcement");
const protect = require("../middleware/authMiddleware");

// =========================
// Create Announcement
// =========================
router.post("/", protect, async (req, res) => {
  try {
    const { title, message } = req.body;

    const announcement = new Announcement({
      title,
      message,
      postedBy: req.user,
    });

    await announcement.save();

    res.status(201).json({
      message: "Announcement created successfully",
      announcement,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

// =========================
// Get All Announcements
// =========================
router.get("/", async (req, res) => {
  try {
    const announcements = await Announcement.find().populate(
      "postedBy",
      "name email"
    );

    res.status(200).json(announcements);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

// =========================
// Update Announcement
// =========================
router.put("/:id", protect, async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);

    if (!announcement) {
      return res.status(404).json({
        message: "Announcement not found",
      });
    }

    if (announcement.postedBy.toString() !== req.user) {
      return res.status(401).json({
        message: "Not authorized",
      });
    }

    announcement.title = req.body.title || announcement.title;
    announcement.message = req.body.message || announcement.message;

    const updatedAnnouncement = await announcement.save();

    res.status(200).json({
      message: "Announcement updated successfully",
      updatedAnnouncement,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

// =========================
// Delete Announcement
// =========================
router.delete("/:id", protect, async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);

    if (!announcement) {
      return res.status(404).json({
        message: "Announcement not found",
      });
    }

    if (announcement.postedBy.toString() !== req.user) {
      return res.status(401).json({
        message: "Not authorized",
      });
    }

    await Announcement.findByIdAndDelete(req.params.id);

    res.status(200).json({
      message: "Announcement deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

module.exports = router;