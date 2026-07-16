// seven-os/financial/calculate/materials.js

export function calculateMaterialsCost(items = []) {
  let total = 0;

  const breakdown = items.map(item => {
    const {
      name,
      unitCost = 0,
      quantity = 1,
      regionMultiplier = 1.0,
      sectorMultiplier = 1.0
    } = item;

    const cost = unitCost * quantity * regionMultiplier * sectorMultiplier;
    total += cost;

    return {
      name,
      unitCost,
      quantity,
      regionMultiplier,
      sectorMultiplier,
      cost
    };
  });

  return {
    total,
    breakdown
  };
}
