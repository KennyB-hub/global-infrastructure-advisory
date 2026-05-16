// © 2026 Global Infrastructure Advisory
// Seven Runtime — Voice Event Bus

import { SevenNarrator, NarratorEvent } from "./seven-narrator";

export class VoiceBus {
    private narrator: SevenNarrator;

    constructor(narrator: SevenNarrator) {
        this.narrator = narrator;
    }

    async emit(ev: NarratorEvent) {
        return this.narrator.handleEvent(ev);
    }
}
