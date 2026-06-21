import fs from "node:fs";
import path from "node:path";
import { IntegrityCheck } from "./integrity-check.js";
import queue from "./sync-queue.json" assert { type: "json" };

export class IntegrityDrone {
  static getQueuePath() {
    return path.resolve("backend/utilities/integrity/sync-queue.json");
  }

  static saveQueue() {
    fs.writeFileSync(
      IntegrityDrone.getQueuePath(),
      JSON.stringify(queue, null, 2),
      "utf-8"
    );
  }

  static enqueue(action) {
    queue.pending.push({
      ...action,
      timestamp: new Date().toISOString()
    });
    IntegrityDrone.saveQueue();
  }

  // uplinkFn: async (items) => { ... send to API / worker ... }
  static async sync(uplinkFn) {
    const integrity = IntegrityCheck.scan();
    if (!integrity.healthy) {
      console.warn("Integrity issues detected:", integrity.missing);
    }

    if (!queue.pending.length) return;

    const toSend = [...queue.pending];
    try {
      await uplinkFn(toSend);
      queue.pending = [];
      IntegrityDrone.saveQueue();
    } catch (err) {
      console.error("Sync failed, keeping queue:", err.message);
    }
  }
}
