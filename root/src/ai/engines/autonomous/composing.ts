type InfraEvent = {
  id: string;
  timestamp: string;
  sector: "tower" | "fiber" | "power" | "ems" | "ag" | "system";
  type: "info" | "warning" | "critical";
  source: string;
  location?: { lat: number; lon: number; zone?: string };
  payload: Record<string, any>;
};

type SevenResponse = {
  severity: "info" | "warning" | "critical";
  summary: string;
  details: string[];
  recommendedActions: string[];
  audience: string[];
};

type SevenOutputs = {
  voice: { audience: string[]; text: string };
  text: { audience: string[]; text: string };
  haptic: { audience: string[]; pattern: string };
};

function composeOutputs(r: SevenResponse): SevenOutputs {
  const voiceText = `
Analysis: ${r.summary}
${r.details.join(" ")}
Recommended: ${r.recommendedActions.join(" ")}
  `.trim();

  const shortText = `⚠ ${r.summary}`;

  const pattern =
    r.severity === "critical"
      ? "LONG_LONG"
      : r.severity === "warning"
      ? "DOUBLE_SHORT"
      : "SINGLE_SHORT";

  return {
    voice: { audience: r.audience, text: voiceText },
    text: { audience: r.audience, text: shortText },
    haptic: { audience: r.audience, pattern },
  };
}
