import { RoutingEngine } from "./routing-engine";

export class MissionRouter {
  static getRoutesForSector(sector: string) {
    return RoutingEngine.getEngineRoutes().filter(route =>
      route.startsWith(sector)
    );
  }

  static assignMission(sector: string, missionId: string) {
    const routes = this.getRoutesForSector(sector);

    return {
      missionId,
      sector,
      routes
    };
  }
}
