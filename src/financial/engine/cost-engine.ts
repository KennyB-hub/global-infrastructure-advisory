export function calculateCost(model, params) {
  switch (model.type) {
    case "infrastructure":
      return calculateInfrastructureCost(model, params);
    case "drone":
      return calculateDroneCost(model, params);
    case "labor":
      return calculateLaborCost(model, params);
    case "materials":
      return calculateMaterialCost(model, params);
    default:
      throw new Error("Unknown cost model type");
  }
}
