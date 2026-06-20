export const ZONE_DB_MAP = {
  public: "DB_PUBLIC",
  apps: "DB_APPS",
  farmer: "DB_APPS",
  contractor: "DB_APPS",
  gov: "DB_GOV",
  admin: "DB_ADMIN",
  system: "DB_SYSTEM"
};

export function getDBForZone(zone) {
  const db = ZONE_DB_MAP[zone];
  if (!db) throw new Error(`INVALID_DB_ZONE: ${zone}`);
  return db;
}

/**
 * Global Infrastructure Advisory (GIA) Core Identity Mapping
 * Binds your federal EIN and SAM.gov registrations to Seven-OS
 */
const GIA_SOVEREIGN_IDENTITY = {
    companyName: "Global Infrastructure Advisory LLC",
    status: "ACTIVE_SOCIETAL_CONTRACTOR",
    runtimeAuthority: "Level-3 Conditional Autonomy",
    identifiers: {
        ein: "YOUR_EIN_NUMBER_HERE",
        samGovId: "YOUR_SAM_GOV_REGISTRATION_TOKEN"
    },
    sectorsTracked: 38,
    healthCeiling: "97%-100%"
};

console.log("🔒 GIA Sovereign Business Identity bound to Seven-OS Execution Runtime.");
module.exports = { GIA_SOVEREIGN_IDENTITY };

