// map-utils.js
// Frontend-only helpers for rendering map overlays

export const MapUtils = {
  drawSectors(ctx, sectors) {
    if (!sectors) return;

    sectors.forEach(sec => {
      ctx.fillStyle = sec.color || "rgba(0,150,255,0.3)";
      ctx.beginPath();
      ctx.arc(sec.x, sec.y, sec.radius || 20, 0, Math.PI * 2);
      ctx.fill();
    });
  },

  drawRisk(ctx, risk) {
    if (!risk) return;

    risk.forEach(r => {
      ctx.fillStyle = r.level === "high"
        ? "rgba(255,0,0,0.4)"
        : r.level === "medium"
        ? "rgba(255,165,0,0.4)"
        : "rgba(0,255,0,0.3)";

      ctx.beginPath();
      ctx.arc(r.x, r.y, r.radius || 25, 0, Math.PI * 2);
      ctx.fill();
    });
  },

  drawRoutes(ctx, routes) {
    if (!routes) return;

    ctx.strokeStyle = "rgba(255,255,255,0.8)";
    ctx.lineWidth = 2;

    routes.forEach(route => {
      ctx.beginPath();
      route.points.forEach((p, i) => {
        if (i === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      });
      ctx.stroke();
    });
  },

  clear(ctx, canvas) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
};
