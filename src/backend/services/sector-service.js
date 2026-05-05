// /services/sector-service.js
import { LogicEngine } from "../ai/engines/logic-engine.js";

export class SectorService {
  constructor() {
    this.logic = new LogicEngine();
  }

  route(input) {
    return this.logic.routeToSector(input);
  }
}
