// ---------------------------------------------------------
// BASE SETUP
// ---------------------------------------------------------
const gmapCanvas = document.getElementById("gmap-canvas");
const gmapCtx = gmapCanvas.getContext("2d");
const gmapMeta = document.getElementById("gmap-meta");
const gmapSummary = document.getElementById("gmap-summary");

async function fetchJson(url) {
  try {
    const res = await fetch(url, { headers: { "Accept": "application/json" } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn("Live data fetch failed:", url, err);
    return null;
  }
}

// View state
let view = {
  zoom: 1,
  minZoom: 0.5,
  maxZoom: 4,
  offsetX: 0,
  offsetY: 0,
  isPanning: false,
  lastX: 0,
  lastY: 0
};

// Resize canvas to container
function resizeCanvas() {
  const rect = gmapCanvas.getBoundingClientRect();
  gmapCanvas.width = rect.width;
  gmapCanvas.height = Math.max(380, rect.width * 0.5);
}

// ---------------------------------------------------------
// LAYER TOGGLES
// ---------------------------------------------------------
const layerPower = document.getElementById("layer-power");
const layerWater = document.getElementById("layer-water");
const layerTelecom = document.getElementById("layer-telecom");
const layerLogistics = document.getElementById("layer-logistics");
const layerRisk = document.getElementById("layer-risk");
const layerRoute = document.getElementById("layer-route");

// ---------------------------------------------------------
// DATA
// ---------------------------------------------------------
let sectorPoints = {
  power: [
    { x: -80, y: 20 },
    { x: 10, y: 30 },
    { x: 100, y: -10 }
  ],
  water: [
    { x: -60, y: -10 },
    { x: 40, y: 10 }
  ],
  telecom: [
    { x: -100, y: 40 },
    { x: 80, y: -20 }
  ],
  logistics: [
    { x: -20, y: 0 },
    { x: 120, y: 30 }
  ]
};

let riskZones = [
  {
    id: "flood-basin-1",
    type: "flood",
    points: [
      { x: -90, y: 10 },
      { x: -70, y: 15 },
      { x: -60, y: 0 },
      { x: -80, y: -5 }
    ]
  },
  {
    id: "fire-zone-1",
    type: "fire",
    points: [
      { x: 80, y: 0 },
      { x: 100, y: 5 },
      { x: 110, y: -10 },
      { x: 90, y: -15 }
    ]
  }
];

let routes = [
  {
    id: "relief-corridor-1",
    type: "relief",
    points: [
      { x: -100, y: 0 },
      { x: -80, y: 10 },
      { x: -60, y: 5 },
      { x: -40, y: 15 }
    ]
  },
  {
    id: "logistics-corridor-1",
    type: "logistics",
    points: [
      { x: 20, y: -10 },
      { x: 40, y: -5 },
      { x: 60, y: 0 },
      { x: 80, y: 5 }
    ]
  }
];

// Convert fake lat/lon to globe projection
function projectPoint(px, py) {
  const radX = (px / 180) * Math.PI;
  const radY = (py / 90) * Math.PI;

  return {
    x: 260 * Math.sin(radX),
    y: 260 * 0.55 * Math.sin(radY)
  };
}

// ---------------------------------------------------------
// DRAW LAYERS
// ---------------------------------------------------------
function drawSectorLayer() {
  gmapCtx.save();

  const { width, height } = gmapCanvas;
  gmapCtx.translate(width / 2 + view.offsetX, height / 2 + view.offsetY);
  gmapCtx.scale(view.zoom, view.zoom);

  if (layerPower?.checked) {
    gmapCtx.fillStyle = "#ef4444";
    sectorPoints.power.forEach((p) => {
      const { x, y } = projectPoint(p.x, p.y);
      gmapCtx.beginPath();
      gmapCtx.arc(x, y, 6 / view.zoom, 0, Math.PI * 2);
      gmapCtx.fill();
    });
  }

  if (layerWater?.checked) {
    gmapCtx.fillStyle = "#3b82f6";
    sectorPoints.water.forEach((p) => {
      const { x, y } = projectPoint(p.x, p.y);
      gmapCtx.beginPath();
      gmapCtx.arc(x, y, 6 / view.zoom, 0, Math.PI * 2);
      gmapCtx.fill();
    });
  }

  if (layerTelecom?.checked) {
    gmapCtx.fillStyle = "#a855f7";
    sectorPoints.telecom.forEach((p) => {
      const { x, y } = projectPoint(p.x, p.y);
      gmapCtx.beginPath();
      gmapCtx.arc(x, y, 6 / view.zoom, 0, Math.PI * 2);
      gmapCtx.fill();
    });
  }

  if (layerLogistics?.checked) {
    gmapCtx.fillStyle = "#22c55e";
    sectorPoints.logistics.forEach((p) => {
      const { x, y } = projectPoint(p.x, p.y);
      gmapCtx.beginPath();
      gmapCtx.arc(x, y, 6 / view.zoom, 0, Math.PI * 2);
      gmapCtx.fill();
    });
  }

  gmapCtx.restore();
}

function drawRiskLayer() {
  if (!layerRisk?.checked) return;

  gmapCtx.save();

  const { width, height } = gmapCanvas;
  gmapCtx.translate(width / 2 + view.offsetX, height / 2 + view.offsetY);
  gmapCtx.scale(view.zoom, view.zoom);

  riskZones.forEach((zone) => {
    const color =
      zone.type === "flood"
        ? "rgba(59, 130, 246, 0.25)"
        : "rgba(248, 113, 113, 0.25)";

    gmapCtx.fillStyle = color;
    gmapCtx.strokeStyle = color.replace("0.25", "0.8");
    gmapCtx.lineWidth = 2 / view.zoom;

    const pts = zone.points.map((p) => projectPoint(p.x, p.y));

    gmapCtx.beginPath();
    pts.forEach((pt, idx) => {
      if (idx === 0) gmapCtx.moveTo(pt.x, pt.y);
      else gmapCtx.lineTo(pt.x, pt.y);
    });
    gmapCtx.closePath();
    gmapCtx.fill();
    gmapCtx.stroke();
  });

  gmapCtx.restore();
}

function drawRouteLayer() {
  if (!layerRoute?.checked) return;

  gmapCtx.save();

  const { width, height } = gmapCanvas;
  gmapCtx.translate(width / 2 + view.offsetX, height / 2 + view.offsetY);
  gmapCtx.scale(view.zoom, view.zoom);

  routes.forEach((route) => {
    const color =
      route.type === "relief"
        ? "#facc15" // yellow
        : "#22c55e"; // green

    gmapCtx.strokeStyle = color;
    gmapCtx.lineWidth = 3 / view.zoom;

    const pts = route.points.map((p) => projectPoint(p.x, p.y));

    gmapCtx.beginPath();
    pts.forEach((pt, idx) => {
      if (idx === 0) gmapCtx.moveTo(pt.x, pt.y);
      else gmapCtx.lineTo(pt.x, pt.y);
    });
    gmapCtx.stroke();

    if (pts.length >= 2) {
      gmapCtx.fillStyle = color;
      const start = pts[0];
      const end = pts[pts.length - 1];

      gmapCtx.beginPath();
      gmapCtx.arc(start.x, start.y, 5 / view.zoom, 0, Math.PI * 2);
      gmapCtx.fill();

      gmapCtx.beginPath();
      gmapCtx.arc(end.x, end.y, 5 / view.zoom, 0, Math.PI * 2);
      gmapCtx.fill();
    }
  });

  gmapCtx.restore();
}

// ---------------------------------------------------------
// DRAW GLOBE (SINGLE SOURCE OF TRUTH)
// ---------------------------------------------------------
function drawBaseGlobe() {
  resizeCanvas();
  const { width, height } = gmapCanvas;

  gmapCtx.save();
  gmapCtx.clearRect(0, 0, width, height);

  gmapCtx.translate(width / 2 + view.offsetX, height / 2 + view.offsetY);
  gmapCtx.scale(view.zoom, view.zoom);

  gmapCtx.fillStyle = "#020617";
  gmapCtx.fillRect(-width, -height, width * 2, height * 2);

  gmapCtx.strokeStyle = "#1d4ed8";
  gmapCtx.lineWidth = 2 / view.zoom;
  gmapCtx.beginPath();
  gmapCtx.ellipse(0, 0, 260, 260 * 0.55, 0, 0, Math.PI * 2);
  gmapCtx.stroke();

  gmapCtx.restore();

  drawSectorLayer();
  drawRiskLayer();
  drawRouteLayer();
}

// ---------------------------------------------------------
// ZOOM + PAN ENGINE
// ---------------------------------------------------------
gmapCanvas.addEventListener("mousedown", (e) => {
  view.isPanning = true;
  view.lastX = e.clientX;
  view.lastY = e.clientY;
});

window.addEventListener("mouseup", () => {
  view.isPanning = false;
});

window.addEventListener("mousemove", (e) => {
  if (!view.isPanning) return;

  const dx = e.clientX - view.lastX;
  const dy = e.clientY - view.lastY;

  view.lastX = e.clientX;
  view.lastY = e.clientY;

  view.offsetX += dx;
  view.offsetY += dy;

  drawBaseGlobe();
  setMeta();
});

gmapCanvas.addEventListener(
  "wheel",
  (e) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
    view.zoom = Math.min(view.maxZoom, Math.max(view.minZoom, view.zoom * zoomFactor));
    drawBaseGlobe();
    setMeta();
  },
  { passive: false }
);

window.addEventListener("resize", drawBaseGlobe);

// ---------------------------------------------------------
// META + TOGGLES
// ---------------------------------------------------------
function setMeta() {
  gmapMeta.textContent = `Zoom ${view.zoom.toFixed(2)} · Offset (${view.offsetX.toFixed(
    0
  )}, ${view.offsetY.toFixed(0)})`;
}

[
  layerPower,
  layerWater,
  layerTelecom,
  layerLogistics,
  layerRisk,
  layerRoute
].forEach((el) => {
  el?.addEventListener("change", drawBaseGlobe);
});
// ---------------------------------------------------------
// LIVE DATA INGESTION ENGINE
// ---------------------------------------------------------

async function refreshSectors() {
  const data = await fetchJson("/api/map/sectors");
  if (!data) return;

  // Expecting shape:
  // { power: [{x,y},...], water: [...], telecom: [...], logistics: [...] }
  sectorPoints = {
    power: data.power ?? sectorPoints.power,
    water: data.water ?? sectorPoints.water,
    telecom: data.telecom ?? sectorPoints.telecom,
    logistics: data.logistics ?? sectorPoints.logistics
  };

  drawBaseGlobe();
}

async function refreshRisk() {
  const data = await fetchJson("/api/map/risk");
  if (!data) return;

  // Expecting shape:
  // [ { id, type, points: [{x,y}, ...] }, ... ]
  riskZones = Array.isArray(data) && data.length ? data : riskZones;

  drawBaseGlobe();
}

async function refreshRoutes() {
  const data = await fetchJson("/api/map/routes");
  if (!data) return;

  // Expecting shape:
  // [ { id, type, points: [{x,y}, ...] }, ... ]
  routes = Array.isArray(data) && data.length ? data : routes;

  drawBaseGlobe();
}

function startLiveIngestion() {
  // Initial pull
  refreshSectors();
  refreshRisk();
  refreshRoutes();

  // Polling cadence (tune as needed)
  setInterval(refreshSectors, 30_000); // 30s
  setInterval(refreshRisk, 45_000);    // 45s
  setInterval(refreshRoutes, 20_000);  // 20s
}

// ---------------------------------------------------------
// INIT
// ---------------------------------------------------------
drawBaseGlobe();
setMeta();
startLiveIngestion();

gmapSummary.innerHTML = `
  <h3>Summary</h3>
  <p>Zoom, pan, toggle sectors, risk, and routes. Live data is pulled from /api/map/* endpoints.</p>
`;
