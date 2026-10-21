const PDFDocument = require("pdfkit");

// ==============================
// Lecture-notes PDF for a course, built from its structured lessons.
// full = true includes each lesson's whole explanation (showcase courses);
// otherwise the notes list objectives, key concepts and takeaways.
//
// Uses the built-in Helvetica font (no embedded font files keeps each PDF
// small), so characters outside its WinAnsi encoding are mapped to plain
// equivalents first.
// ==============================

const BRAND = "#E75480";
const INK = "#2E2E2E";
const MUTED = "#6B6B6B";

const REPLACEMENTS = [
  [/₹/g, "Rs "], [/♯/g, "#"], [/♭/g, "b"], [/≈/g, "~"], [/≥/g, ">="], [/≤/g, "<="],
  [/→/g, "->"], [/←/g, "<-"], [/√/g, "sqrt"], [/Σ/g, "sum "], [/μ/g, "mu"], [/σ/g, "sigma"],
  [/x̄/g, "x-bar"], [/ŷ/g, "y-hat"], [/[₀]/g, "0"], [/[₁]/g, "1"], [/ⁿ/g, "^n"], [/𝄞|𝄢/g, ""],
  [/°/g, " deg"], [/−/g, "-"],
];
const WINANSI_EXTRA = new Set([..."€‚ƒ„…†‡ˆ‰Š‹ŒŽ‘’“”•–—˜™š›œžŸ"]);

const toWinAnsi = (text) => {
  let value = String(text || "");
  for (const [pattern, replacement] of REPLACEMENTS) value = value.replace(pattern, replacement);
  return [...value].filter((ch) => ch.charCodeAt(0) <= 0xff || WINANSI_EXTRA.has(ch)).join("");
};

// Markdown → plain paragraphs (headings, lists and code kept readable).
const markdownToBlocks = (markdown) => {
  const blocks = [];
  let code = null;
  for (const raw of String(markdown || "").split("\n")) {
    const line = raw.replace(/\s+$/, "");
    if (line.trim().startsWith("```")) {
      if (code) { blocks.push({ type: "code", text: code.join("\n") }); code = null; } else code = [];
      continue;
    }
    if (code) { code.push(line); continue; }
    if (!line.trim()) { blocks.push({ type: "gap" }); continue; }
    const clean = line.replace(/\*\*(.+?)\*\*/g, "$1").replace(/`([^`]+)`/g, "$1").replace(/(^|\s)\*(\S[^*]*)\*/g, "$1$2");
    if (/^#{1,6}\s/.test(clean)) blocks.push({ type: "heading", text: clean.replace(/^#+\s*/, "") });
    else if (/^\s*([-*•]|\d+[.)])\s/.test(clean)) blocks.push({ type: "bullet", text: clean.replace(/^\s*([-*•]|\d+[.)])\s+/, "") });
    else blocks.push({ type: "text", text: clean });
  }
  return blocks;
};

const buildLectureNotesPdf = ({ courseName, category, level, description, outcomes, modules, full }) =>
  new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: "A4",
      margin: 56,
      info: { Title: toWinAnsi(`Lecture Notes - ${courseName}`), Author: "Study Buddy", Subject: toWinAnsi(category) },
    });
    const chunks = [];
    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const width = doc.page.width - 112;
    const text = (value, options = {}) => doc.text(toWinAnsi(value), { width, ...options });
    const heading = (value, size, color = INK) => { doc.moveDown(0.6).font("Helvetica-Bold").fontSize(size).fillColor(color); text(value); doc.moveDown(0.2); };
    const body = (value) => { doc.font("Helvetica").fontSize(10.5).fillColor(INK); text(value, { lineGap: 2 }); };
    const bullet = (value) => { doc.font("Helvetica").fontSize(10.5).fillColor(INK); text(`•  ${value}`, { indent: 8, lineGap: 2 }); };

    // Cover
    doc.font("Helvetica-Bold").fontSize(11).fillColor(BRAND);
    text("STUDY BUDDY - LECTURE NOTES");
    doc.moveDown(0.8).font("Helvetica-Bold").fontSize(22).fillColor(INK);
    text(courseName);
    doc.moveDown(0.3).font("Helvetica").fontSize(11).fillColor(MUTED);
    text(`${category} · ${level} · ${modules.reduce((n, m) => n + m.lessons.length, 0)} lessons`);
    heading("About this course", 13, BRAND);
    body(description);
    heading("What you will be able to do", 13, BRAND);
    (outcomes || []).forEach(bullet);
    heading("Course outline", 13, BRAND);
    modules.forEach((m, i) => bullet(`Module ${i + 1}: ${m.title} - ${m.lessons.map((l) => l.title).join(", ")}`));

    for (const [mi, m] of modules.entries()) {
      doc.addPage();
      heading(`Module ${mi + 1}: ${m.title}`, 17, BRAND);
      if (m.summary) body(m.summary);
      for (const lesson of m.lessons) {
        const l = lesson.learning || {};
        heading(lesson.title, 13.5);
        if (lesson.description) { doc.font("Helvetica-Oblique").fontSize(10.5).fillColor(MUTED); text(lesson.description, { lineGap: 2 }); }
        if (l.objectives?.length) {
          doc.moveDown(0.3).font("Helvetica-Bold").fontSize(10.5).fillColor(INK); text("Learning objectives");
          l.objectives.forEach(bullet);
        }
        if (full && l.explanation) {
          doc.moveDown(0.3);
          for (const block of markdownToBlocks(l.explanation)) {
            if (block.type === "gap") doc.moveDown(0.3);
            else if (block.type === "heading") { doc.font("Helvetica-Bold").fontSize(11).fillColor(INK); text(block.text); }
            else if (block.type === "bullet") bullet(block.text);
            else if (block.type === "code") { doc.font("Courier").fontSize(9).fillColor(INK); text(block.text, { lineGap: 1 }); }
            else body(block.text);
          }
        }
        if (l.concepts?.length) {
          doc.moveDown(0.3).font("Helvetica-Bold").fontSize(10.5).fillColor(INK); text("Key concepts");
          l.concepts.forEach((c) => bullet(`${c.term}: ${c.definition}`));
        }
        if (l.takeaways?.length) {
          doc.moveDown(0.3).font("Helvetica-Bold").fontSize(10.5).fillColor(INK); text("Key takeaways");
          l.takeaways.forEach(bullet);
        }
      }
    }

    doc.moveDown(1).font("Helvetica").fontSize(9).fillColor(MUTED);
    text("Prepared for Study Buddy learners. Work through each lesson and its lesson check in the course for the full explanations, worked examples and practice.");
    doc.end();
  });

module.exports = { buildLectureNotesPdf, toWinAnsi };
