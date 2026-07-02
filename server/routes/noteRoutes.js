const express = require("express");
const router = express.Router();
const multer = require("multer");
const Note = require("../models/Note");
const protect = require("../middleware/authMiddleware");

// =========================
// Multer Storage Setup
// =========================
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

// =========================
// Upload Note
// =========================
router.post("/", protect, upload.single("file"), async (req, res) => {
  try {
    const { title, subject } = req.body;

    if (!title || !subject) {
      return res.status(400).json({
        message: "Title and subject are required",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        message: "File is required",
      });
    }

    const note = new Sote({
      title: title,
      subject: subject,
      file: req.file.path,
      uploadedBy: req.user,
    });

    await note.save();

    res.status(201).json({
      message: "Note uploaded successfully",
      note,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

// =========================
// Get All Notes
// =========================
router.get("/", async (req, res) => {
  try {
    const notes = await Note.find().populate("uploadedBy", "name email");

    res.status(200).json(notes);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});
// =========================
// Update Note
// =========================
router.put("/:id", protect, upload.single("file"), async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);

    if (!note) {
      return res.status(404).json({
        message: "Note not found",
      });
    }

    if (note.uploadedBy.toString() !== req.user) {
      return res.status(401).json({
        message: "Not authorized",
      });
    }

    note.title = req.body.title || note.title;
    note.subject = req.body.subject || note.subject;

    if (req.file) {
      note.file = req.file.path;
    }

    const updatedNote = await note.save();

    res.status(200).json({
      message: "Note updated successfully",
      updatedNote,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});
// =========================
// Delete Note
// =========================
router.delete("/:id", protect, async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);

    if (!note) {
      return res.status(404).json({
        message: "Note not found",
      });
    }

    if (note.uploadedBy.toString() !== req.user) {
      return res.status(401).json({
        message: "Not authorized",
      });
    }

    await Note.findByIdAndDelete(req.params.id);

    res.status(200).json({
      message: "Note deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});
module.exports = router;