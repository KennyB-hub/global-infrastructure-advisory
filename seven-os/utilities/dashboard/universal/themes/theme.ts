// © 2026 Global Infrastructure Advisory
// Universal Dashboard Theme Interface

export interface DashboardTheme {
  name: string;
  accent: string;
  background: string;
  density: "compact" | "comfortable";
  contrast: "low" | "medium" | "high";
  hologram: "none" | "soft" | "strong";
  motion: "minimal" | "normal" | "expressive";
}
