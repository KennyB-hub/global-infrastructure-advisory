// seven-os/system/get-ai-routing-map.js
// GIA Sovereign Routing Map – V12 Alpha

import systemManifest from "../config/system-manifest.json" assert { type: "json" };
import nodeRegistry from "../config/node-registry.json" assert { type: "json" };
import clusterHealth from "../config/cluster-health.json" assert { type: "json" };

export function getAiRoutingMap() {
    const timestamp = new Date().toISOString();

    // Build dynamic node list
    const nodes = nodeRegistry.clusters.map(c => ({
        name: c.name,
        sector: c.sector,
        hostname: c.hostname,
        port: c.port,
        tls: c.tls
    }));

    // Build dynamic cluster health list
    const clusters = clusterHealth.clusters.map(c => ({
        name: c.name,
        sector: c.sector,
        status: c.status,
        health_score: c.health_score
    }));

    return {
        timestamp,

        platform: {
            id: systemManifest.platform_id,
            version: systemManifest.version,
            failsafe: systemManifest.failsafe_level,
            active_sectors: systemManifest.active_sectors,
            endpoints: systemManifest.endpoints
        },

        trustZones: {
            public: {
                base: "/public",
                access: "open",
                description: "General public access"
            },
            contractor: {
                base: "/contractor",
                access: "auth-required",
                description: "Verified contractor access"
            },
            farmer: {
                base: "/farmer",
                access: "auth-required",
                description: "Agriculture & field operations"
            },
            gov: {
                base: "/gov",
                access: "restricted",
                description: "Government-level access"
            },
            deepgov: {
                base: "/deepgov",
                access: "sovereign-only",
                description: "Deep sovereign intelligence"
            },
            admin: {
                base: "/admin",
                access: "admin-only",
                description: "Administrative control plane"
            },
            system: {
                base: "/system",
                access: "system-only",
                description: "System diagnostics & AI internals"
            }
        },

        systemEndpoints: [
            "/system/status",
            "/system/full-report",
            "/system/domains",
            "/system/trust",
            "/system/uptime",
            "/system/infrastructure",
            "/system/storage",
            "/system/routing",
            "/system/health",
            "/system/security",
            "/system/ai",
            "/system/map"
        ],

        ai: {
            cortex: "/api/cortex",
            decisionEngine: "/api/decision",
            deepMind: "/api/deep-mind"
        },

        nodes,
        clusters
    };
}

