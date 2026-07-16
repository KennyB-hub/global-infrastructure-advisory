// seven-os/backend/system/trust.js

export function getTrustZones() {
  return {
    public: { level: 1, allowed: ["read"], restricted: ["write", "admin"] },
    contractor: { level: 2, allowed: ["read", "limited-write"], restricted: ["admin"] },
    farmer: { level: 2, allowed: ["read", "limited-write"], restricted: ["admin"] },
    employee: { level: 3, allowed: ["read", "write"], restricted: ["admin"] },
    admin: { level: 4, allowed: ["read", "write", "admin"], restricted: [] },
    gov: { level: 5, allowed: ["read", "write", "secure"], restricted: ["deepgov"] },
    deepgov: { level: 6, allowed: ["sovereign"], restricted: [] },
    system: { level: 7, allowed: ["root"], restricted: [] }
  };
}
