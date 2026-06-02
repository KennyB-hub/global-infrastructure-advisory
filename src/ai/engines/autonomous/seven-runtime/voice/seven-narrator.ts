// © 2026 Global Infrastructure Advisory
// Seven Runtime — SevenNarrator (Voice + Emo + Events)

import { DisasterProfile } from "../safety/disaster-profile";

export type NarratorChannel = "operator" | "responder" | "public" | "victim";

export interface NarratorEvent {
    type:
        | "MISSION_START"
        | "MISSION_END"
        | "HAZARD_DETECTED"
        | "ENTER_ZONE"
        | "EXIT_ZONE"
        | "RESCUE_INBOUND"
        | "RESCUE_COMPLETE";
    sector: string;
    disasterType?: string;
    details?: Record<string, any>;
}

export interface NarratorSink {
    speak(channel: NarratorChannel, text: string): void | Promise<void>;
}

export class SevenNarrator {
    private sink: NarratorSink;
    private currentProfile: DisasterProfile | null = null;

    constructor(sink: NarratorSink) {
        this.sink = sink;
    }

    setDisasterProfile(profile: DisasterProfile | null) {
        this.currentProfile = profile;
    }

    async handleEvent(ev: NarratorEvent) {
        const emo = this.currentProfile?.emo;
        const tone = emo?.tone ?? "neutral";

        switch (ev.type) {
            case "MISSION_START":
                await this.speak("operator", emo?.messages.missionStart
                    ?? `Starting ${ev.sector} mission.`);
                break;

            case "MISSION_END":
                await this.speak("operator", emo?.messages.missionEnd
                    ?? `Completed ${ev.sector} mission.`);
                break;

            case "HAZARD_DETECTED":
                await this.speak("responder", emo?.messages.hazardDetected
                    ?? `Hazard detected. Adjusting route.`);
                break;

            case "RESCUE_INBOUND":
                await this.speak("victim",
                    `I see you. I’m sending a drone to your location now. Stay where you are.`);
                break;

            case "RESCUE_COMPLETE":
                await this.speak("responder",
                    `Rescue operation complete for sector ${ev.sector}.`);
                break;

            case "ENTER_ZONE":
                await this.speak("operator", emo?.messages.enteringZone
                    ?? `Entering ${ev.sector} zone.`);
                break;

            case "EXIT_ZONE":
                await this.speak("operator", emo?.messages.leavingZone
                    ?? `Exiting ${ev.sector} zone.`);
                break;
        }

        // tone is available if you want to route to different TTS voices/styles
        void tone;
    }

    private async speak(channel: NarratorChannel, text: string) {
        await this.sink.speak(channel, text);
    }
}
