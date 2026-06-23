// © 2026 Global Infrastructure Advisory
// Universal Dashboard Renderer — Sector + Mission + Role Adaptive

import {
  CATTLE_LOCATE_LAYOUT,
  CATTLE_LOAD_LAYOUT,
  CATTLE_HAUL_LAYOUT,
  DRONE_SCAN_LAYOUT,
  DRONE_PATROL_LAYOUT,
  DRONE_INSPECTION_LAYOUT,
  RESCUE_DRONE_LAYOUT,
  RESCUE_ROVER_LAYOUT,
  EMT_LAYOUT,
  GRID_INSPECTION_LAYOUT,
  WATER_SYSTEM_LAYOUT,
  TELECOM_TOWER_LAYOUT,
  PIPELINE_SCAN_LAYOUT,
  PIPELINE_LEAK_LAYOUT,
  GENERIC_STATUS_LAYOUT
} from "./layouts";

import {
  MapWidget,
  ListWidget,
  CardWidget,
  FeedWidget,
  GraphWidget
} from "./widgets";

import {
  FARMER_THEME,
  CONTRACTOR_THEME,
  GOV_THEME,
  PUBLIC_THEME,
  PILOT_THEME,
  EMT_THEME,
  DEFAULT_THEME
} from "./themes";

import { resolveBinding } from "./bindings";
import { UIShellBuilder } from "./shell/builder";

export class UniversalDashboardRenderer {
  constructor(stack) {
    this.stack = stack;
    this.runtime = stack.runtime;
    this.shell = new UIShellBuilder();
  }

  render(context) {
    const sector = this.detectSector(context);
    const mission = this.detectMission(context);
    const role = this.detectRole(context);

    const layout = this.loadLayout(sector, mission);
    const widgets = this.loadWidgets(sector, mission, role);
    const theme = this.loadTheme(role);

    return this.compose(layout, widgets, theme, context);
  }

  // -----------------------------
  // DETECTORS
  // -----------------------------
  detectSector(ctx) {
    if (ctx.sector) return ctx.sector;
    if (ctx.mission?.startsWith("CATTLE")) return "AGRICULTURE";
    if (ctx.mission?.startsWith("DRONE")) return "AIR";
    if (ctx.mission?.startsWith("GRID")) return "GRID";
    if (ctx.mission?.startsWith("PIPELINE")) return "PIPELINE";
    if (ctx.mission?.startsWith("RESCUE")) return "EMERGENCY";
    return "GENERAL";
  }

  detectMission(ctx) {
    if (ctx.mission) return ctx.mission;
    if (ctx.unitId?.startsWith("COLLAR")) return "CATTLE_LOCATE";
    if (ctx.unitId?.startsWith("DRONE")) return "DRONE_SCAN";
    if (ctx.unitId?.startsWith("ROVER")) return "GROUND_SCAN";
    return "STATUS_OVERVIEW";
  }

  detectRole(ctx) {
    return ctx.role || "OPERATOR";
  }

  // -----------------------------
  // LAYOUT LOADER
  // -----------------------------
  loadLayout(sector, mission) {
    switch (mission) {
      case "CATTLE_LOCATE": return CATTLE_LOCATE_LAYOUT;
      case "CATTLE_LOAD": return CATTLE_LOAD_LAYOUT;
      case "CATTLE_HAUL": return CATTLE_HAUL_LAYOUT;

      case "DRONE_SCAN": return DRONE_SCAN_LAYOUT;
      case "DRONE_PATROL": return DRONE_PATROL_LAYOUT;
      case "DRONE_INSPECTION": return DRONE_INSPECTION_LAYOUT;

      case "RESCUE_DRONE": return RESCUE_DRONE_LAYOUT;
      case "RESCUE_ROVER": return RESCUE_ROVER_LAYOUT;
      case "EMT": return EMT_LAYOUT;

      case "GRID_INSPECTION": return GRID_INSPECTION_LAYOUT;
      case "WATER_SYSTEM": return WATER_SYSTEM_LAYOUT;
      case "TELECOM_TOWER": return TELECOM_TOWER_LAYOUT;

      case "PIPELINE_SCAN": return PIPELINE_SCAN_LAYOUT;
      case "PIPELINE_LEAK": return PIPELINE_LEAK_LAYOUT;

      default: return GENERIC_STATUS_LAYOUT;
    }
  }

  // -----------------------------
  // WIDGET LOADER
  // -----------------------------
  loadWidgets(sector, mission, role) {
    const widgets = [];

    if (mission === "CATTLE_LOCATE") {
      widgets.push(
        new MapWidget("MAP_CATTLE", "cattleLocations"),
        new ListWidget("LIST_CATTLE", "cattleList"),
        new CardWidget("CARD_PASTURE_STATUS", "pastureStatus"),
        new CardWidget("CARD_SYNC_STATUS", "collarSyncStatus")
      );
      return widgets;
    }

    if (mission === "DRONE_SCAN") {
      widgets.push(
        new MapWidget("MAP_DRONE", "dronePosition"),
        new FeedWidget("FEED_VIDEO", "droneVideo"),
        new CardWidget("CARD_MISSION_STATUS", "missionStatus"),
        new CardWidget("CARD_LINK_STATUS", "linkStatus")
      );
      return widgets;
    }

    widgets.push(
      new CardWidget("CARD_SYSTEM_STATUS", "systemStatus"),
      new ListWidget("LIST_EVENTS", "recentEvents"),
      new CardWidget("CARD_NETWORK_STATUS", "networkStatus")
    );

    return widgets;
  }

  // -----------------------------
  // THEME LOADER
  // -----------------------------
  loadTheme(role) {
    switch (role) {
      case "FARMER": return FARMER_THEME;
      case "CONTRACTOR": return CONTRACTOR_THEME;
      case "GOV": return GOV_THEME;
      case "PUBLIC": return PUBLIC_THEME;
      case "PILOT": return PILOT_THEME;
      case "EMT": return EMT_THEME;
      default: return DEFAULT_THEME;
    }
  }

  // -----------------------------
  // FINAL COMPOSITION
  // -----------------------------
  compose(layout, widgets, theme, context) {
    const resolvedWidgets = widgets.map(widget => {
      const data = resolveBinding(widget.binding, this.stack);
      return {
        id: widget.id,
        type: widget.type,
        data: widget.render(data)
      };
    });

    return this.shell.build({
      layout,
      widgets: resolvedWidgets,
      theme,
      context
    });
  }
}
