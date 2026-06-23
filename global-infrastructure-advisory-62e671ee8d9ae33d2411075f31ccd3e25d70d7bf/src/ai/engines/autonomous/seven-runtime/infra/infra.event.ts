type InfraEvent = {
  id: string;
  timestamp: string;
  sector: "tower" | "fiber" | "power" | "ems" | "ag" | "system";
  type: "info" | "warning" | "critical";
  source: string;
  location?: { lat: number; lon: number; zone?: string };
  payload: Record<string, any>;
};

type InfraEvent = {
  id: string;
  timestamp: string;
  sector: "tower" | "fiber" | "power" | "ems" | "ag" | "system";
  type: "info" | "warning" | "critical";
  source: string;
  location?: { lat: number; lon: number; zone?: string };
  payload: Record<string, any>;
};

const topics = [
  "tower.events",
  "fiber.events",
  "power.events",
  "ems.events",
  "ag.events",
  "drone.events",
  "system.health",
];

topics.forEach(t =>
  bus.subscribe(t, (msg) => sevenHandleEvent(JSON.parse(msg)))
);
