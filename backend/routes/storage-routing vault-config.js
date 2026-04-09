// backend/storage-routing/contractor-vault/vault-config.js

export const vaultSettings = {
  storageType: "R2_BUCKET",
  bucketName: "gia-contractor-simulations", // The name of your secure bucket
  allowedExtensions: [".stp", ".dwg", ".ans", ".pdf", ".zip"], // Ansys 2D/3D & reports
  maxFileSize: "500MB", // Enough for heavy simulations
  scrubMetadata: true   // Strips contractor's personal device info on upload
};
