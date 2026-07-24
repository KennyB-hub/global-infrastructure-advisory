// hauler-discovery.js
// V12 Alpha – Hauler Discovery API

const {
  registerHauler,
  listHaulers,
  findHaulersByRegion,
  verifyHauler
} = require("../../ai/hauler-registry");

module.exports = function (router) {
  // Register a hauler
  router.post("/haulers/register", async (req, res) => {
    try {
      const body = await req.json();
      const hauler = registerHauler(body);
      res.json({ ok: true, hauler });
    } catch (err) {
      res.status(400).json({ ok: false, error: err.message });
    }
  });

  // List all haulers
  router.get("/haulers", (req, res) => {
    try {
      res.json({ ok: true, haulers: listHaulers() });
    } catch (err) {
      res.status(400).json({ ok: false, error: err.message });
    }
  });

  // Search by region
  router.get("/haulers/region/:region", (req, res) => {
    try {
      const region = req.params.region;
      const haulers = findHaulersByRegion(region);
      res.json({ ok: true, haulers });
    } catch (err) {
      res.status(400).json({ ok: false, error: err.message });
    }
  });

  // Verify hauler (admin)
  router.post("/haulers/:id/verify", async (req, res) => {
    try {
      const { id } = req.params;
      const hauler = verifyHauler(id, true);
      res.json({ ok: true, hauler });
    } catch (err) {
      res.status(400).json({ ok: false, error: err.message });
    }
  });
};
