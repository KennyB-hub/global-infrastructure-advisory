// template-diff-engine.js
// V12 Alpha – Template Diff Engine

const fs = require("fs");
const path = require("path");

/**
 * Load HTML template file.
 */
function loadHtml(file) {
  const filePath = path.join(process.cwd(), "templates", file);
  return fs.readFileSync(filePath, "utf8");
}

/**
 * Extract placeholders from HTML.
 */
function extractPlaceholders(html) {
  const matches = html.match(/{{(.*?)}}/g) || [];
  return matches.map((m) => m.replace(/{{|}}/g, ""));
}

/**
 * Compute line-by-line diff.
 */
function diffLines(oldHtml, newHtml) {
  const oldLines = oldHtml.split("\n");
  const newLines = newHtml.split("\n");

  const diffs = [];

  const max = Math.max(oldLines.length, newLines.length);

  for (let i = 0; i < max; i++) {
    const oldLine = oldLines[i] || "";
    const newLine = newLines[i] || "";

    if (oldLine !== newLine) {
      diffs.push({
        line: i + 1,
        old: oldLine,
        new: newLine
      });
    }
  }

  return diffs;
}

/**
 * Compare two templates and produce a diff report.
 */
function diffTemplates(oldTemplate, newTemplate) {
  const oldHtml = loadHtml(oldTemplate.file);
  const newHtml = loadHtml(newTemplate.file);

  const oldPlaceholders = extractPlaceholders(oldHtml);
  const newPlaceholders = extractPlaceholders(newHtml);

  const missingInNew = oldPlaceholders.filter((p) => !newPlaceholders.includes(p));
  const addedInNew = newPlaceholders.filter((p) => !oldPlaceholders.includes(p));

  const lineDiffs = diffLines(oldHtml, newHtml);

  return {
    from: oldTemplate.templateId,
    to: newTemplate.templateId,
    placeholderChanges: {
      removed: missingInNew,
      added: addedInNew
    },
    lineChanges: lineDiffs,
    summary: {
      totalLineChanges: lineDiffs.length,
      placeholdersAdded: addedInNew.length,
      placeholdersRemoved: missingInNew.length
    }
  };
}

module.exports = {
  diffTemplates
};
