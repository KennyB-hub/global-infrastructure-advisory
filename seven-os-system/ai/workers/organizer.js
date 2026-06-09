// organize.js — V12 Alpha Stable Build
// Restores missionControl so 7‑of‑9 can route, validate, and organize files safely.

const missionControl = {
  public: {
    css: ["Main.css"],
    assets: ["*.svg", "*.png", "*.jpg"],
    html: ["*.html"]
  },

  src: {
    hubs: [
      "PublicHub.js",
      "Dashboard.js",
      "Contractor/",
      "Staff/",
      "hr/"
    ],
    ai: [
      "ai-geo.js",
      "ai-engine/",
      "policies/"
    ],
    data: [
      "policies/",
      "marketplace/",
      "sectors/"
    ]
  },

  rules: {
    autoMoveHTML: true,
    autoFixExtensions: true,
    validatePaths: true,
    allowAutoCreateDirs: true
  }
};

module.exports = missionControl;

