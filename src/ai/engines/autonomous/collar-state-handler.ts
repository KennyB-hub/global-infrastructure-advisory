import fs from "fs";
import path from "path";

export const collarStateHandler = {
  id: "collar-state-handler",
  event: "CATTLE_STATE_UPDATED",
  priority: 100,
  handler: async (event: any) => {
    try {
      const state = event.payload || {};
      const collarId = state.collarId || state.animalId || `unknown_${Date.now()}`;

      const storeDir = path.join(process.cwd(), "data");
      const storeFile = path.join(storeDir, "collar-states.json");

      if (!fs.existsSync(storeDir)) fs.mkdirSync(storeDir, { recursive: true });

      let data: any = {};
      if (fs.existsSync(storeFile)) {
        try {
          const raw = fs.readFileSync(storeFile, "utf8");
          data = raw ? JSON.parse(raw) : {};
        } catch (e) {
          data = {};
        }
      }

      data[collarId] = {
        collarId,
        animalId: state.animalId || null,
        gps: state.gps || null,
        battery: state.battery || null,
        motion: state.motion || null,
        lastSeen: state.lastSeen || Date.now(),
        pastureId: state.pastureId || null,
        updatedAt: Date.now(),
        raw: state.raw || state
      };

      fs.writeFileSync(storeFile, JSON.stringify(data, null, 2), "utf8");
      console.log(`[Handler] Persisted collar ${collarId} state to ${storeFile}`);
    } catch (err) {
      console.error("[Handler] Failed to persist collar state:", err);
    }
  }
};
