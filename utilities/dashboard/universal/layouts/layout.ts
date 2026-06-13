// © 2026 Global Infrastructure Advisory
// Universal Dashboard Layout Interface

export interface DashboardLayout {
  id: string;
  regions: {
    main: string[];
    side?: string[];
    footer?: string[];
  };
}
