// © 2026 Global Infrastructure Advisory
// Universal UI Shell — OS-Level Dashboard Container

export interface UIShell {
  id: string;
  theme: any;
  layout: any;
  widgets: any[];
  context: any;
  timestamp: number;

  // Optional: AR/VR/HUD metadata
  hologram?: {
    intensity: "none" | "soft" | "strong";
    depth: number;
  };

  // Optional: motion/animation profile
  motion?: {
    profile: "minimal" | "normal" | "expressive";
  };
}
