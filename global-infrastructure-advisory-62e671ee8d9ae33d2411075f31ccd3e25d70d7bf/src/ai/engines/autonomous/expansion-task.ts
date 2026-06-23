handlers["update-sector-templates"] = async () => {
  const manifest = JSON.parse(fs.readFileSync("data/global-manifest.json", "utf8"));
  const sectors = manifest.sectors || [];

  for (const sector of sectors) {
    if (!sector.id) continue;

    const folder = `data/sectors/${sector.id}`;
    const file = `${folder}/sector.json`;

    if (!fs.existsSync(folder)) fs.mkdirSync(folder, { recursive: true });

    const template = {
      id: sector.id,
      label: sector.label || sector.title || sector.id,
      category: sector.category || "general",
      description: sector.description || "",
      features: sector.features || [],
      status: "draft",
      createdAt: new Date().toISOString(),

      logic: {
        workflows: true,
        compliance: true,
        ux: true,
        ai: true
      },

      workflows: [],
      compliance: [],
      ux_rules: [],
      ai_engine: []
    };

    fs.writeFileSync(file, JSON.stringify(template, null, 2));
  }
};
