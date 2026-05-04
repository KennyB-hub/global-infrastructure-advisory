if (url.pathname === "/system/domains" && request.method === "GET") {
    return new Response(JSON.stringify({
        domains: {
            contractor: "ready",
            farmer: "ready",
            public: "ready",
            gov: "ready",
            deepgov: "ready"
        },
        timestamp: Date.now()
    }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
    });
}
