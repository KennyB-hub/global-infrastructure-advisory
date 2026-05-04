if (url.pathname === "/system/trust" && request.method === "GET") {
    return new Response(JSON.stringify({
        trustZones: {
            public: "open",
            contractor: "auth-required",
            farmer: "auth-required",
            gov: "restricted",
            deepgov: "sovereign-only"
        },
        enforcement: "active",
        timestamp: Date.now()
    }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
    });
}
