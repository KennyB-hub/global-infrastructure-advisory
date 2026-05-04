export async function onRequest() {
    const map = {
        timestamp: new Date().toISOString(),
        organs: {
            infrastructure: {
                root: "src/backend/infrastructure/",
                core: [
                    "bootstrap.yaml",
                    "diagnostics.js",
                    "routing-inspector.js",
                    "ssh-manager.js"
                ],
                tools: [
                    "tools/r2-uploader.js",
                    "tools/r2-check.js",
                    "tools/r2-inspector.js",
                    "tools/r2-bucket-list.js",
                    "tools/r2-exposure.js",
                    "tools/r2-health.js",
                    "tools/storage-inspector.js"
                ],
                utils: [
                    "utils/safe-shell.js",
                    "utils/infra-logger.js",
                    "utils/normalize-path.js",
                    "utils/parse-endpoint.js"
                ]
            },
            security: {
                root: "src/backend/security/",
                tools: [
                    "tools/inspect-routing.js",
                    "tools/threat-scan.js"
                ]
            },
            systemWorkers: {
                root: "src/backend/workers/system/",
                endpoints: [
                    "system-status.js",
                    "diagnostics.js",
                    "system-infrastructure.js",
                    "system-routing.js",
                    "system-storage.js",
                    "system-health.js",
                    "system-full-report.js",
                    "threat-report.js",
                    "system-endpoints.js",
                    "system-security.js",
                    "system-ai.js",
                    "system-map.js",
                    "index.js"
                ]
            }
        }
    };

    return new Response(JSON.stringify({
        system: "map",
        status: "ok",
        map
    }, null, 2), {
        headers: { "Content-Type": "application/json" }
    });
}
