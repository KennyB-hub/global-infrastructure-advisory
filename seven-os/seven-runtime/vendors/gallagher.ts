// cattle/vendors/gallagher.ts
import { CollarAdapter, CollarState } from "../cattle/types";

export class GallagherAdapter implements CollarAdapter {
  vendor = "Gallagher";

  async fetchStates(): Promise<CollarState[]> {
    // TODO: Replace with real Gallagher API integration
    // For now, return mock data shaped like real output
    return [
      {
        collarId: "GAL-001",
        animalId: "TAG-123",
        gps: {
          lat: 38.9,
          lon: -80.2,
          distanceToBoundary: 15,
          outsidePasture: false,
        },
        battery: 76,
        motion: "walking",
        lastSeen: Date.now(),
        pastureId: "NORTH_PASTURE",
      },
    ];
  }
}
