// autonomous/seven/core/mci/index.ts
import { loadMci } from "./loader";

const mci = loadMci();

export function getSector(name: string) {
  return mci.sectors[name] ?? null;
}

export function listInfrastructureAssets() {
  const sector = mci.sectors["infrastructure"];
  return sector?.assets ?? [];
}

export function listSupplyItems() {
  const sector = mci.sectors["supply-chain"];
  return sector?.inventory ?? [];
}

export function getItemById(id: string) {
  // naive scan across sectors; you can optimize later
  for (const sectorName of Object.keys(mci.sectors)) {
    const sector = mci.sectors[sectorName] as any;
    for (const key of Object.keys(sector)) {
      const arr = sector[key];
      if (Array.isArray(arr)) {
        const found = arr.find((x: any) => x.id === id);
        if (found) return { sector: sectorName, kind: key, item: found };
      }
    }
  }
  return null;
}
