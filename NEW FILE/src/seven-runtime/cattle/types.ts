// root/src/ai/autonomous/seven-runtime/cattle/types.ts

export interface CollarState {
    collarId: string;
    animalId?: string;
    gps: {
        lat: number;
        lon: number;
        distanceToBoundary: number;
        outsidePasture: boolean;
    };
    battery: number;
    motion: "idle" | "walking" | "running";
    lastSeen: number;
    pastureId?: string;
}

export interface CollarAdapter {
    vendor: string;
    fetchStates(): Promise<CollarState[]>;
}
