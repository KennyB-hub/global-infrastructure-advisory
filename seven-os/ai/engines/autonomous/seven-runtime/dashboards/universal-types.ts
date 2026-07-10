export type Sector =
  | "public"
  | "contractor"
  | "farmer"
  | "gov"
  | "deepgov"
  | "system";

export type Mission =
  | "cattle"
  | "drone"
  | "fence"
  | "telemetry"
  | "routing"
  | "cyber"
  | "cloud"
  | "disaster";

export interface WidgetDefinition {
  id: string;
  component: string;
  dataBindings: string[];
}

export interface LayoutDefinition {
  layout: string;
  widgets: WidgetDefinition[];
}

export interface ThemeDefinition {
  name: string;
  hologram: boolean;
  colors: Record<string, string>;
}

export interface DashboardConfig {
  sector: Sector;
  mission: Mission;
  layout: LayoutDefinition;
  theme: ThemeDefinition;
}
