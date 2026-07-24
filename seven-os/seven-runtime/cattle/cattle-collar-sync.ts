// root/src/ai/autonomous/seven-runtime/cattle/collar-sync.ts

import { publishEvent } from "../event-bus";
import { CollarAdapter, CollarState } from "./types";
import { WaveTechAdapter } from "./vendors/wavetech";
import { MoovementAdapter } from "./vendors/moovement";
import { GallagherAdapter } from "../vendors/gallagher";

export class CollarSyncService {
    private adapters: CollarAdapter[] = [];

    constructor() {
        // Register all supported collar brands
        this.adapters.push(new WaveTechAdapter());
        this.adapters.push(new MoovementAdapter());
        this.adapters.push(new GallagherAdapter());
    }

    async syncAll() {
        for (const adapter of this.adapters) {
            try {
                const states = await adapter.fetchStates();

                for (const state of states) {
                    const normalized = this.normalizeState(state, adapter.vendor);

                    await publishEvent("CATTLE_STATE_UPDATED", normalized);

                    this.evaluateRules(normalized);
                }
            } catch (err) {
                console.error(`Collar sync failed for ${adapter.vendor}`, err);
            }
        }
    }

    normalizeState(state: CollarState, vendor: string) {
        return {
            vendor,
            collarId: state.collarId,
            animalId: state.animalId ?? null,
            gps: state.gps,
            battery: state.battery,
            motion: state.motion,
            lastSeen: state.lastSeen,
            pastureId: state.pastureId ?? null,
            raw: state
        };
    }

    evaluateRules(state: any) {
        // Boundary logic
        if (state.gps?.distanceToBoundary < 10) {
            publishEvent("CATTLE_NEAR_BOUNDARY", state);
        }

        if (state.gps?.outsidePasture) {
            publishEvent("CATTLE_OUT_OF_PASTURE", state);
        }

        // Missing collar logic
        const minutesSinceSeen = (Date.now() - state.lastSeen) / 60000;
        if (minutesSinceSeen > 30) {
            publishEvent("CATTLE_MISSING", state);
        }
    }
}

// Run every X minutes
export const collarSync = new CollarSyncService();
