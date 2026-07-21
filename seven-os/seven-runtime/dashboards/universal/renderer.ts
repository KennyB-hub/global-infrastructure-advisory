import {
  Sector,
  Mission,
  DashboardConfig,
  LayoutDefinition,
  ThemeDefinition
} from "../../../autonomous/core/fcc/carrier-network-compliance/governance-brain/types";
import { farmerCattleLayout } from "./layouts/farmer.cattle.layout";
import { govCyberLayout } from "./layouts/gov.cyber.layout";
import { Holo2050Theme } from "./themes/holo2050.theme";

function resolveLayout(sector: Sector, mission: Mission): LayoutDefinition {
  if (sector === "farmer" && mission === "cattle") return farmerCattleLayout;
  if (sector === "gov" && mission === "cyber") return govCyberLayout;
  // add more sector/mission combos here
  throw new Error(`No layout for sector=${sector}, mission=${mission}`);
}

function resolveTheme(sector: Sector): ThemeDefinition {
  // you can branch per sector later; for now, all use Holo2050
  return Holo2050Theme;
}

export function buildDashboardConfig(
  sector: Sector,
  mission: Mission
): DashboardConfig {
  const layout = resolveLayout(sector, mission);
  const theme = resolveTheme(sector);

  return {
    sector,
    mission,
    layout,
    theme
  };
}
