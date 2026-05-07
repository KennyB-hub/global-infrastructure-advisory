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
