// © 2026 Global Infrastructure Advisory
// Seven Runtime — Interoperability Layer (CAD / C2 / SCADA / NACI / NAP)

import { SevenStack } from "../../seven-runtime/stack/seven-stack";
import { RescueRequest, GroundRescueRequest } from "../../seven-runtime/rescue/seven-rescue-commander";
import { NAPEvent } from "../sectors/nap-sectors";

export type ExternalSystem = "CAD" | "C2" | "SCADA" | "NACI" | "NAP";

export interface ExternalEvent {
    system: ExternalSystem;
    type: string;
    payload: any;
}

export class SevenInterop {
    private stack: SevenStack;

    constructor(stack: SevenStack) {
        this.stack = stack;
    }

    // ---------------------------------------------------------
    // MAIN ROUTER
    // ---------------------------------------------------------
    async handleEvent(ev: ExternalEvent) {
        switch (ev.system) {
            case "CAD":
                return this.handleCADEvent(ev);
            case "C2":
                return this.handleC2Event(ev);
            case "SCADA":
                return this.handleSCADAEvent(ev);
            case "NACI":
                return this.handleNACIEvent(ev);
            case "NAP":
                return this.handleNAPEvent(ev);
            default:
                return { error: "Unknown external system", ev };
        }
    }

    // ---------------------------------------------------------
    // CAD (911 Dispatch)
    // ---------------------------------------------------------
    private async handleCADEvent(ev: ExternalEvent) {
        if (ev.type === "RESCUE_REQUEST") {
            const req = ev.payload as RescueRequest;
            return this.stack.rescue.launchRescue(req);
        }

        if (ev.type === "GROUND_SEARCH") {
            const req = ev.payload as GroundRescueRequest;
            return this.stack.rescue.launchGroundSearch(req);
        }

        return { error: "Unknown CAD event", ev };
    }

    // ---------------------------------------------------------
    // C2 (Command & Control)
    // ---------------------------------------------------------
    private async handleC2Event(ev: ExternalEvent) {
        if (ev.type === "MISSION_STATUS") {
            return {
                runtime: this.stack.runtime,
                drones: this.stack.droneRegistry.list(),
                ground: this.stack.groundRegistry.list()
            };
        }

        if (ev.type === "UNIT_QUERY") {
            return {
                drones: this.stack.droneRegistry.list(),
                ground: this.stack.groundRegistry.list()
            };
        }

        return { error: "Unknown C2 event", ev };
    }

    // ---------------------------------------------------------
    // SCADA (Infrastructure Systems)
    // ---------------------------------------------------------
    private async handleSCADAEvent(ev: ExternalEvent) {
        if (ev.type === "PIPELINE_ALERT") {
            return this.stack.rescue.launchRescue(ev.payload);
        }

        if (ev.type === "POWERLINE_FAULT") {
            return this.stack.rescue.launchRescue(ev.payload);
        }

        return { error: "Unknown SCADA event", ev };
    }

    // ---------------------------------------------------------
    // NACI (Identity / Clarksburg)
    // ---------------------------------------------------------
    private async handleNACIEvent(ev: ExternalEvent) {
        if (ev.type === "IDENTITY_VERIFY") {
            return { status: "OK", id: ev.payload.id };
        }

        if (ev.type === "LOCATION_REQUEST") {
            return {
                drones: this.stack.droneRegistry.list(),
                ground: this.stack.groundRegistry.list()
            };
        }

        return { error: "Unknown NACI event", ev };
    }

    // ---------------------------------------------------------
    // NAP (Neighborhood Action Program)
    // ---------------------------------------------------------
    private async handleNAPEvent(ev: ExternalEvent) {
        const nap = ev.payload as NAPEvent;

        switch (nap.agency) {
            case "code-enforcement":
                return this.stack.runtime.analyzeInfrastructure?.(nap.payload);

            case "public-works":
                return this.stack.rescue.launchRescue(nap.payload);

            case "police":
                return this.stack.rescue.launchGroundSearch(nap.payload);

            case "fire":
            case "ems":
                return this.stack.rescue.launchRescue(nap.payload);

            default:
                return { error: "Unknown NAP agency", nap };
        }
    }
}
