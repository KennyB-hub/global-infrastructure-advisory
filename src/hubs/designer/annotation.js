const canvas = document.getElementById("annot-canvas");
const ctx = canvas.getContext("2d");
const blueprint = document.getElementById("annot-blueprint");

let tool = "pen";
let drawing = false;
let color = document.getElementById("annot-color").value;
let size = document.getElementById("annot-size").value;

function resizeCanvas() {
  canvas.width = blueprint.clientWidth;
  canvas.height = blueprint.clientHeight;
}
window.addEventListener("resize", resizeCanvas);
blueprint.onload = resizeCanvas;

document.querySelectorAll(".tool-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    tool = btn.dataset.tool || tool;
  });
});

canvas.addEventListener("mousedown", e => {
  drawing = true;
  ctx.beginPath();
  ctx.moveTo(e.offsetX, e.offsetY);
});

canvas.addEventListener("mousemove", e => {
  if (!drawing) return;
  ctx.strokeStyle = color;
  ctx.lineWidth = size;
  ctx.lineTo(e.offsetX, e.offsetY);
  ctx.stroke();
});

canvas.addEventListener("mouseup", () => drawing = false);

document.getElementById("annot-color").addEventListener("input", e => {
  color = e.target.value;
});

document.getElementById("annot-size").addEventListener("input", e => {
  size = e.target.value;
});

document.getElementById("annot-clear").addEventListener("click", () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
});
