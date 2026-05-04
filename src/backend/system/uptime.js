import { systemUptime } from "./system-endpoints.js";

let coldStart = Date.now();

export function getUptime() {
    return systemUptime(coldStart);
}
