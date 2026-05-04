import { systemDomains } from "./system-endpoints.js";

export function getDomainStatus() {
    return systemDomains();
}
