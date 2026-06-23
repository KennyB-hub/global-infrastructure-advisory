// Validates the structure for your Sectors and Spaces
export const sectorSchema = {
  id: "string",
  name: "string",
  coordinates: { x: "number", y: "number", z: "number" },
  status: ["active", "idle", "locked"],
  metadata: "object"
};

export const spaceConfig = {
  theme: "string",
  dimensions: "object",
  allowInference: "boolean"
};
