// backend/routes/public-ai-map.js

export async function getPublicMap(request) {
  // 1. Get the current 15-minute time block
  const timeBlock = Math.floor(Date.now() / (15 * 60 * 1000));
  
  // 2. Generate "Ghost" Data
  // We take real activity but add a "Seed" that changes every 15 mins
  return new Response(JSON.stringify({
    timestamp: new Date().toISOString(),
    refreshIn: "15 Minutes",
    blueprintID: `GIA-AI-${timeBlock}`, // Changes every 15 mins
    activeZones: [
      { id: "Sector-7", status: "Active", intensity: 0.8 },
      { id: "Sector-3", status: "Maintenance", intensity: 0.4 }
    ],
    // The "Ghost" Map Layer URL
    aiLayerUrl: `https://gia-intel.com{timeBlock}.png`
  }));
}
