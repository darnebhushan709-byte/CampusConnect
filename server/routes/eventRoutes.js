const express = require("express");
const router = express.Router();
const Event = require("../models/Event");
const protect = require("../middleware/authMiddleware");

// =========================
// Create Event
// =========================
router.post("/", protect, async (req, res) => {
  try {
    const { title, description, date, venue } = req.body;

    const event = new Event({
      title,
      description,
      date,
      venue,
      createdBy: req.user,
    });

    await event.save();

    res.status(201).json({
      message: "Event created successfully",
      event,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});
// =========================
// Get All Events
// =========================
router.get("/", async (req, res) => {
  try {
    const events = await Event.find().populate("createdBy", "name email");

    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});
// =========================
// Update Event
// =========================
router.put("/:id", protect, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        message: "Event not found",
      });
    }

    if (event.createdBy.toString() !== req.user) {
      return res.status(401).json({
        message: "Not authorized",
      });
    }

    event.title = req.body.title || event.title;
    event.description = req.body.description || event.description;
    event.date = req.body.date || event.date;
    event.venue = req.body.venue || event.venue;

    const updatedEvent = await event.save();

    res.status(200).json({
      message: "Event updated successfully",
      updatedEvent,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});
// =========================
// Delete Event
// =========================
// =========================
// Delete Event
// =========================
router.delete("/:id", protect, async (req, res) => {
  try {
    // Find Event
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        message: "Event not found",
      });
    }

    // Check Ownership
    if (event.createdBy.toString() !== req.user) {
      return res.status(401).json({
        message: "Not authorized",
      });
    }

    // Delete Event
    await Event.findByIdAndDelete(req.params.id);

    res.status(200).json({
      message: "Event deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

module.exports = router;