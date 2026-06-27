if (mode === "mapping") {
    console.log("Running CSV mapping test…");

    const csv = loadCSV("sector-worker-mapping.csv");

    console.log("CSV length:", csv.length);
    console.log("CSV preview:\n", csv.split("\n").slice(0, 5).join("\n"));

    process.exit(0);
}
