// cattle-rules.ts
import { publishEvent } from "../event-bus";
import { NormalizedCattleState } from "./models";

export function evaluateCattleState(state: NormalizedCattleState) {
    // boundary
    if (state.gps.distanceToBoundary < 10 && !state.gps.outsidePasture) {
        publishEvent("CATTLE_NEAR_BOUNDARY", state);
    }

    if (state.gps.outsidePasture) {
        publishEvent("CATTLE_OUT_OF_PASTURE", state);
    }

    // missing
    const minutesSinceSeen = (Date.now() - state.lastSeen) / 60000;
    if (minutesSinceSeen > 30) {
        publishEvent("CATTLE_MISSING", state);
    }
}
