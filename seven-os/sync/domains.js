import { systemDomains } from "../system/system-endpoints.js";

export function getDomainStatus() {
    return systemDomains();
}
