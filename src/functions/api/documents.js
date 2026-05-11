// documents.js
// V12 Alpha – Public Document API (Firewall Protected)

const express = require("express");
const router = express.Router();

const {
  firewallGenerateDocumentFromQuery
} = require("../ai/trustzone-firewall");

/**
 * POST /api/documents/generate
 * Body:
 * {
 *   "query": "I need my contractor onboarding packet",
 *   "trustZone": "contractor",
 *   "userData": { ...optional fields... }
 * }
 */
router.post("/generate", async (req, res) => {
  try {
    const { query, trustZone, userData = {} } = req.body;

    if (!query || !trustZone) {
      return res.status(400).json({
        error: "Missing required fields: query, trustZone"
      });
    }

    // V12 Alpha: firewall‑protected generation
    const pdf = await firewallGenerateDocumentFromQuery(
      query,
      trustZone,
      userData
    );

    return res.json({
      status: "success",
      trustZone,
      file: pdf.filename,
      path: pdf.path
    });
  } catch (err) {
    return res.status(403).json({
      status: "error",
      message: err.message
    });
  }
});

module.exports = router;
