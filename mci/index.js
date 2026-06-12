// seven-os/ai/mci/index.js

import { loadMci } from "./loader.js";

const mci = loadMci();

export function getSector(name) {
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

export function getItemById(id) {
  for (const sectorName of Object.keys(mci.sectors)) {
    const sector = mci.sectors[sectorName];
    for (const key of Object.keys(sector)) {
      const arr = sector[key];
      if (Array.isArray(arr)) {
        const found = arr.find(x => x.id === id);
        if (found) return { sector: sectorName, kind: key, item: found };
      }
    }
  }
  return null;
}
