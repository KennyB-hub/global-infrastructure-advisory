import { RoutingEngine } from "../../proprietary-cli/commands/activate/routing-engine";
import { WorkerDiscovery } from "../autonomous/route/worker-discovery";

export class MissionRouter {
  static identity() {
    return RoutingEngine.identity;
  }

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
      routes,
      identity: RoutingEngine.identity
    };
  }

  static listSectors() {
    return RoutingEngine.getEngineRoutes()
      .map(route => route.split(".")[0])
      .filter((v, i, a) => a.indexOf(v) === i);
  }

  static getWorkersForSector(sector: string) {
    return WorkerDiscovery.listWorkers().filter(w => w.sector === sector);
  }
}

