// cyber.router.ts – V12 Alpha
// Routes cyber events to the Cyber Worker logic.

import cyberWorker from "./cyber.worker";

export class CyberRouter {
  /**
   * Main router entry point
   */
  static async route(event: any) {
    if (!event || !event.type) {
      return {
        worker: "cyber",
        error: "Invalid event: missing type"
      };
    }

    // Normalize event type
    const type = event.type.toLowerCase();

    // Route based on event type
    if (type.startsWith("cyber.")) {
      return await cyberWorker.handle(event);
    }

    // Unknown event
    return {
      worker: "cyber",
      error: `CyberRouter: Unrecognized event type '${event.type}'`
    };
  }
}
