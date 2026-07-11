import { pathToFileURL } from "url";

export const name = "routing-map-test";

export function run() {
    console.log("Routing map test placeholder");
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
    run();
}
