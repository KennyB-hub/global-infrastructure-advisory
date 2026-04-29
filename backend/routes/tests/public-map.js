// backend/routes/public-map.js

export async function handlePublicMap(request) {
  // NO IDENTITY CHECK HERE - This is the Public Front Porch
  return new Response(JSON.stringify({
    status: "Viewing GIA Public Insight",
    mapLayers: [
      { name: "Regional Activity", color: "rgba(45, 90, 39, 0.4)", density: "High" },
      { name: "AI Planning Grid", type: "Decoy" }
    ],
    // We only send GENERAL zone names, never GPS
    activeZones: ["Sector-A (Active)", "Sector-D (Planning)"]
  }));
}
