export function getAiRoutingMap() {
    return {
        timestamp: new Date().toISOString(),
        zones: {
            public: {
                base: "/public",
                access: "open"
            },
            contractor: {
                base: "/contractor",
                access: "auth-required"
            },
            farmer: {
                base: "/farmer",
                access: "auth-required"
            },
            gov: {
                base: "/gov",
                access: "restricted"
            },
            deepgov: {
                base: "/deepgov",
                access: "sovereign-only"
            },
            admin: {
                base: "/admin",
                access: "admin-only"
            },
            system: {
                base: "/system",
                access: "system-only"
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
        ]
    };
}
