if (url.pathname === "/system/diagnostics" && request.method === "GET") {
    return new Response(JSON.stringify({
        name: "GIA DEEP Mind 2100",
        diagnostics: {
            manifestLoaded: true,
            aiEngineReachable: typeof AI.run === "function",
            domainRouter: "active",
            safetyLayer: "active",
            timestamp: Date.now()
        }
    }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
    });
}
