import { systemTrust } from "./system-endpoints.js";

export function getTrustZones() {
    return systemTrust();
}
