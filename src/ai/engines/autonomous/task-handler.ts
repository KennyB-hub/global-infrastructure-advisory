handlers["generate-compliance"] = async () => {
  const manifest = JSON.parse(fs.readFileSync("data/global-manifest.json", "utf8"));
  const sectors = manifest.sectors || [];

  for (const sector of sectors) {
    if (!sector.id) continue;

    const folder = `data/sectors/${sector.id}`;
    const file = `${folder}/compliance.json`;

    const compliance = generateComplianceForSector(sector);

    fs.writeFileSync(file, JSON.stringify(compliance, null, 2));
  }
};
