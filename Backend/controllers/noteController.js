const mongoose = require("mongoose");
const Note = require("../models/Note");

const MAX_NOTES = 500;

const pickFields = (body = {}) => {
  const fields = {};
  for (const key of ["title", "course", "content", "color"]) {
    if (body[key] !== undefined) fields[key] = typeof body[key] === "string" ? body[key] : String(body[key]);
  }
  return fields;
};

const validationMessage = (error) =>
  error?.name === "ValidationError" ? Object.values(error.errors)[0]?.message : null;

// ==============================
// GET /api/notes — the user's notes, most recently updated first.
// ==============================
const getNotes = async (req, res) => {
  try {
    const notes = await Note.find({ owner: req.user._id }).sort({ updatedAt: -1 }).limit(MAX_NOTES).lean();
    res.status(200).json({ success: true, count: notes.length, data: notes });
  } catch (error) {
    console.error("Get Notes Error:", error.message);
    res.status(500).json({ success: false, message: "Unable to load your notes." });
  }
};

// ==============================
// POST /api/notes  { title, course?, content?, color? }
// ==============================
const createNote = async (req, res) => {
  try {
    const fields = pickFields(req.body);
    if (!fields.title || !fields.title.trim()) {
      return res.status(400).json({ success: false, message: "Please give the note a title." });
    }
    if ((await Note.countDocuments({ owner: req.user._id })) >= MAX_NOTES) {
      return res.status(400).json({ success: false, message: `You can keep up to ${MAX_NOTES} notes.` });
    }
    const note = await Note.create({ ...fields, course: fields.course?.trim() || "General", owner: req.user._id });
    res.status(201).json({ success: true, data: note });
  } catch (error) {
    const message = validationMessage(error);
    if (message) return res.status(400).json({ success: false, message });
    console.error("Create Note Error:", error.message);
    res.status(500).json({ success: false, message: "Unable to save the note." });
  }
};

// ==============================
// PUT /api/notes/:id
// ==============================
const updateNote = async (req, res) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, owner: req.user._id });
    if (!note) return res.status(404).json({ success: false, message: "Note not found." });
    Object.assign(note, pickFields(req.body));
    await note.save();
    res.status(200).json({ success: true, data: note });
  } catch (error) {
    const message = validationMessage(error);
    if (message) return res.status(400).json({ success: false, message });
    console.error("Update Note Error:", error.message);
    res.status(500).json({ success: false, message: "Unable to update the note." });
  }
};

// ==============================
// DELETE /api/notes/:id
// ==============================
const deleteNote = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid id." });
    }
    const result = await Note.deleteOne({ _id: req.params.id, owner: req.user._id });
    if (!result.deletedCount) return res.status(404).json({ success: false, message: "Note not found." });
    res.status(200).json({ success: true, message: "Note deleted." });
  } catch (error) {
    console.error("Delete Note Error:", error.message);
    res.status(500).json({ success: false, message: "Unable to delete the note." });
  }
};

module.exports = { getNotes, createNote, updateNote, deleteNote };
