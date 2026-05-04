if (url.pathname === "/system/status" && request.method === "GET") {
    return new Response(JSON.stringify({
        name: "GIA DEEP Mind 2100",
        status: "online",
        engine: manifest.engine,
        version: manifest.version,
        environment: manifest.environment,
        features: manifest.features,
        timestamp: Date.now()
    }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
    });
}
