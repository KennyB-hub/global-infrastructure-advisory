// AI Blueprint Analyzer Starter

const aiUpload = document.getElementById("ai-analyze-upload");
const aiBtn = document.getElementById("ai-analyze-btn");
const aiCanvas = document.getElementById("ai-analyze-canvas");
const aiCtx = aiCanvas.getContext("2d");
const aiReport = document.getElementById("ai-analyze-report");

let aiImage = new Image();

aiUpload.addEventListener("change", e => {
  const file = e.target.files[0];
  if (!file) return;

  aiImage.src = URL.createObjectURL(file);
  aiImage.onload = () => {
    aiCanvas.width = aiImage.width;
    aiCanvas.height = aiImage.height;
    aiCtx.drawImage(aiImage, 0, 0);
  };
});

aiBtn.addEventListener("click", () => {
  if (!aiImage.src) return;

  aiCtx.drawImage(aiImage, 0, 0);

  // Basic edge detection (placeholder)
  aiCtx.strokeStyle = "#38bdf8";
  aiCtx.lineWidth = 2;

  // Fake detection for demo
  aiCtx.strokeRect(50, 50, aiCanvas.width - 100, aiCanvas.height - 100);

  // AI Report (placeholder)
  aiReport.innerHTML = `
    <h3>AI Structural Analysis</h3>
    <p><strong>Detected Type:</strong> Building / Facility</p>
    <p><strong>Key Features:</strong></p>
    <ul>
      <li>Rectilinear structural grid</li>
      <li>Probable load-bearing walls</li>
      <li>Utility corridor alignment</li>
      <li>Potential HVAC or pipeline routing</li>
    </ul>
  `;
});
