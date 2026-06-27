if (mode === "routing") {
    console.log("Running routing map test…");

    const routing = loadJSON("routing-map.json");

    console.log("Routing sectors:", Object.keys(routing.sectors));
    console.log("Routing workers:", Object.keys(routing.workers));

    process.exit(0);
}
