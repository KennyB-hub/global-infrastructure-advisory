// workers/universal-intake.ts
export default {
  async fetch(request, env) {
    if (request.method !== "POST") return new Response("GIA Intake Only", { status: 405 });

    try {
      const input = await request.json();
      const { type, payload, contractorId } = input;

      // 1. Identify Sector & Routing
      let targetWorker;
      switch (type) {
        case "GPS_SITE_MAP": 
          targetWorker = env.FIELD_ENGINE; // Routes to GPS/Blueprint logic
          break;
        case "HR_LOGIN": 
          targetWorker = env.AZURE_AUTH; // Routes to Payroll/HR tracking
          break;
        case "SATELLITE_SOIL":
          targetWorker = env.FARMER_HUB; // Routes to Agriculture AI
          break;
        default:
          targetWorker = env.AI_ROUTER; // General deep-thinking
      }

      // 2. Hand-off with Heartbeat Header
      return await targetWorker.fetch(request, {
        headers: { "X-GIA-Pulse": "Steady", "X-Sector": type }
      });

    } catch (err) {
      return new Response("Intake Error: System pulse weak.", { status: 500 });
    }
  }
};
