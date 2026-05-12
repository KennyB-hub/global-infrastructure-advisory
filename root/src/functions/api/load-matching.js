// load-matching.js
// V12 Alpha – Load Creation + Matching API

const {
  createLoad,
  listLoads,
  updateLoadStatus
} = require("../ai/load-registry");
const { matchHaulersForLoad } = require("../ai/load-matching-engine");

module.exports = function (router) {
  // Create a new load (farmer)
  router.post("/loads", async (req, res) => {
    try {
      const body = await req.json();
      const load = createLoad(body);
      res.json({ ok: true, load });
    } catch (err) {
      res.status(400).json({ ok: false, error: err.message });
    }
  });

  // List all loads
  router.get("/loads", (req, res) => {
    try {
      res.json({ ok: true, loads: listLoads() });
    } catch (err) {
      res.status(400).json({ ok: false, error: err.message });
    }
  });

  // Match haulers for a load
  router.get("/loads/:id/matches", (req, res) => {
    try {
      const { id } = req.params;
      const result = matchHaulersForLoad(id);
      res.json({ ok: true, ...result });
    } catch (err) {
      res.status(400).json({ ok: false, error: err.message });
    }
  });

  // Update load status (e.g., matched, completed)
  router.post("/loads/:id/status", async (req, res) => {
    try {
      const { id } = req.params;
      const body = await req.json();
      const updated = updateLoadStatus(id, body.status);
      res.json({ ok: true, load: updated });
    } catch (err) {
      res.status(400).json({ ok: false, error: err.message });
    }
  });
};
