// AI Site Layout Generator

const siteSource = document.getElementById("site-source");
const siteImageInput = document.getElementById("site-image");
const siteImageBlock = document.getElementById("site-image-block");
const siteCoordsBlock = document.getElementById("site-coords-block");
const siteLat = document.getElementById("site-lat");
const siteLon = document.getElementById("site-lon");
const siteLayoutType = document.getElementById("site-layout-type");
const siteConstraints = document.getElementById("site-constraints");
const siteBtn = document.getElementById("btn-generate-site-layout");
const siteCanvas = document.getElementById("site-layout-canvas");
const siteCtx = siteCanvas.getContext("2d");
const siteReport = document.getElementById("site-layout-report");
const siteMeta = document.getElementById("site-layout-meta");

let siteImage = new Image();

siteSource?.addEventListener("change", () => {
  const mode = siteSource.value;
  if (mode === "image") {
    siteImageBlock.classList.remove("hidden");
    siteCoordsBlock.classList.add("hidden");
  } else {
    siteImageBlock.classList.add("hidden");
    siteCoordsBlock.classList.remove("hidden");
  }
});

siteImageInput?.addEventListener("change", e => {
  const file = e.target.files[0];
  if (!file) return;
  siteImage.src = URL.createObjectURL(file);
  siteImage.onload = () => {
    siteCanvas.width = siteImage.width;
    siteCanvas.height = siteImage.height;
    siteCtx.drawImage(siteImage, 0, 0);
  };
});

siteBtn?.addEventListener("click", async () => {
  siteMeta.textContent = "Analyzing…";

  const mode = siteSource.value;
  const layoutType = siteLayoutType.value;
  const constraintsText = siteConstraints.value.trim();

  // Base canvas
  if (mode === "image" && siteImage.src) {
    siteCanvas.width = siteImage.width;
    siteCanvas.height = siteImage.height;
    siteCtx.drawImage(siteImage, 0, 0);
  } else {
    siteCanvas.width = 800;
    siteCanvas.height = 500;
    siteCtx.fillStyle = "#020617";
    siteCtx.fillRect(0, 0, siteCanvas.width, siteCanvas.height);
  }

  // Fake layout overlay (placeholder for real AI output)
  siteCtx.strokeStyle = "#38bdf8";
  siteCtx.lineWidth = 2;

  const pad = 40;
  const w = siteCanvas.width - pad * 2;
  const h = siteCanvas.height - pad * 2;

  // Outer pad
  siteCtx.strokeRect(pad, pad, w, h);

  // Simple internal layout based on type
  if (layoutType === "datacenter") {
    // racks / halls
    for (let i = 0; i < 4; i++) {
      const x = pad + 30 + i * (w / 5);
      siteCtx.strokeRect(x, pad + 40, w / 8, h - 120);
    }
  } else if (layoutType === "house") {
    siteCtx.strokeRect(pad + w * 0.15, pad + h * 0.2, w * 0.3, h * 0.4); // main
    siteCtx.strokeRect(pad + w * 0.5, pad + h * 0.2, w * 0.25, h * 0.25); // garage
  } else if (layoutType === "mine") {
    siteCtx.beginPath();
    siteCtx.moveTo(pad + w * 0.1, pad + h * 0.5);
    siteCtx.lineTo(pad + w * 0.9, pad + h * 0.3);
    siteCtx.stroke();
  } else if (layoutType === "pipeline") {
    siteCtx.beginPath();
    siteCtx.moveTo(pad + 10, pad + h * 0.3);
    siteCtx.lineTo(pad + w - 10, pad + h * 0.7);
    siteCtx.stroke();
  }

  // Report (placeholder – wire to backend later)
  const coordText =
    mode === "coords"
      ? `Coordinates: ${siteLat.value || "N/A"}, ${siteLon.value || "N/A"}`
      : "Source: Uploaded image";

  siteReport.innerHTML = `
    <h3>Proposed Site Layout</h3>
    <p><strong>Layout type:</strong> ${layoutType}</p>
    <p><strong>Source:</strong> ${coordText}</p>
    ${
      constraintsText
        ? `<p><strong>Constraints:</strong> ${constraintsText}</p>`
        : ""
    }
    <p><strong>AI Notes (placeholder):</strong></p>
    <ul>
      <li>Pad oriented to maximize drainage and access.</li>
      <li>Primary footprint sized within typical envelope for ${layoutType}.</li>
      <li>Corridors and clearances left for utilities and maintenance.</li>
    </ul>
  `;

  siteMeta.textContent = "Layout generated (demo)";
});
