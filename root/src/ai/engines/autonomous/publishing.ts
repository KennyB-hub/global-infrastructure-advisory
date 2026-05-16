type InfraEvent = {
  id: string;
  timestamp: string;
  sector: "tower" | "fiber" | "power" | "ems" | "ag" | "system";
  type: "info" | "warning" | "critical";
  source: string;
  location?: { lat: number; lon: number; zone?: string };
  payload: Record<string, any>;
};

async function publishOutputs(o: SevenOutputs) {
  await bus.publish("seven.output.voice", o.voice);
  await bus.publish("seven.output.text", o.text);
  await bus.publish("seven.output.haptic", o.haptic);
}
