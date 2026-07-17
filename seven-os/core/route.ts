// © 2026 Global Infrastructure Advisory
// Seven‑OS — Universal Routing Spine

import { SevenValidator } from "./validator";
import { MissionRouter } from "../core/routing/mission-router";
import { UniversalVehicleRegistry } from "../seven-runtime/adapters/universal-vehicle-registry";
import { SevenRescueCommander } from "../seven-runtime/rescue/seven-rescue-commander";
import { SectorMeta } from "../sector/meta/sector-meta";

// Interop is part of runtime
import { SevenInterop } from "../seven-runtime/interop/seven-interop";

export class SevenRouter {
    constructor(
        private vehicles: UniversalVehicleRegistry,
        private rescue: SevenRescueCommander,
        private missionRouter: MissionRouter,
        private runtimeInterop: SevenInterop
    ) {}

    async route(event: any) {
        SevenValidator.interop(event);

        switch (event.system) {
            case "MISSION":
                return this.routeMission(event);

            case "VEHICLE":
                return this.routeVehicle(event);

            case "RESCUE":
                return this.routeRescue(event);

            case "SECTOR":
                return this.routeSector(event);

            case "INTEROP":
                return this.routeInterop(event);

            case "RUNTIME":
                return this.routeRuntime(event);

            case "AI":
                return this.routeAI(event);

            default:
                return { error: `Unknown route system '${event.system}'`, event };
        }
    }

    async routeMission(event: any) {
        SevenValidator.mission(event.payload);
        return this.missionRouter.dispatch(event.payload);
    }

    async routeVehicle(event: any) {
        const vehicle = this.vehicles.get(event.payload.id);
        if (!vehicle) throw new Error(`Vehicle '${event.payload.id}' not found`);
        return vehicle.plugin.sendCommand(event.payload.command);
    }

    async routeRescue(event: any) {
        const { target, context } = event.payload;
        SevenValidator.rescueTarget(target);
        SevenValidator.rescueContext(context);
        return this.rescue.execute(target, context);
    }

    async routeSector(event: any) {
        const engine = SectorMeta.getEngine(event.payload.sector);
        if (!engine) throw new Error(`Sector engine not found`);
        return engine.handle(event.payload);
    }

    async routeInterop(event: any) {
        return this.runtimeInterop.handleEvent(event.payload);
    }

    async routeRuntime(event: any) {
        return globalThis.SevenRuntime.handle(event.payload);
    }

    async routeAI(event: any) {
        return globalThis.SevenAICortex.run(event.payload.model, event.payload.input);
    }
}
