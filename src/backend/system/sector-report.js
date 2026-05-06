if (url.pathname === "/system/sector-report" && request.method === "POST") {
  try {
    const body = await request.json();

    const input = {
      sector: body.sector,
      data: body.data || {},
      trustZone: "system",
      workflow: "sector-analysis"
    };

    const report = await sectorAnalysisEngine.process(input, env, {
      trustZone: "system",
      workflow: "sector-analysis"
    });

    return json(report);
  } catch (err) {
    return json({ error: "Sector Report Failure", details: err.message }, 500);
  }
}
