import express from "express";
import { InfrastructureAuditEngine } from "../infrastructure/infrastructure-audit-engine.js";

const router = express.Router();

router.get("/:target", async (req, res) => {
  try {
    const target = req.params.target;
    const options = req.query || {};

    const audit = await InfrastructureAuditEngine.runAudit(target, options);

    res.json(audit);
  } catch (err) {
    console.error("Audit error:", err);
    res.status(500).json({ error: "Audit failed." });
  }
});

export default router;
