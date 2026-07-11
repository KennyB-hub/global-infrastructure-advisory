import { pathToFileURL } from "url";

export const name = "csv-mapping-test";

export function run() {
    console.log("CSV mapping test placeholder");
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
    run();
}
