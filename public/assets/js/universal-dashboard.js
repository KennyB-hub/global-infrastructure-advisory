(function () {
  const params = new URLSearchParams(window.location.search);
  const sectorKey = (params.get('sector') || 'global').toLowerCase();
  const regionKey = params.get('region') || 'global';

  const presets = {
    global: {
      name: 'Global',
      title: 'Seven-OS Universal Dashboard',
      subtitle: 'One command surface for every sector, every region, and every mission.',
      heroTitle: 'Global Infrastructure Command',
      heroDesc: 'Route missions, voice commands, telemetry, and safety signals through one shared control layer.',
      metricSector: 'Universal OS',
      metricRegion: regionKey,
      metricStatus: 'Synchronized',
      metricCoverage: 'All sectors',
      intelligenceTitle: 'Cross-sector routing',
      commands: ['Mission orchestration', 'Voice ingress', 'Policy guardrails', 'Shared telemetry'],
      intelligence: ['Route engine', 'Resource pulse', 'Operator handoff', 'Incident synthesis']
    },
    agriculture: {
      name: 'Agriculture',
      title: 'Seven-OS Agriculture Dashboard',
      subtitle: 'Crop, soil, and logistics operations exposed through one pan-sector view.',
      heroTitle: 'Agriculture Operations',
      heroDesc: 'Monitor irrigation, field access, worker activity, and supply chains from one dashboard.',
      metricSector: 'Food systems',
      metricRegion: regionKey,
      metricStatus: 'Active',
      metricCoverage: 'Fields & ports',
      intelligenceTitle: 'Agricultural intelligence',
      commands: ['Dispatch sensors', 'Flag anomalies', 'Coordinate field teams', 'Route supply shipments'],
      intelligence: ['Soil telemetry', 'Climate risk', 'Silo status', 'Cold-chain routing']
    },
    energy: {
      name: 'Energy',
      title: 'Seven-OS Energy Dashboard',
      subtitle: 'Unified operations for generation, transmission, and resilience.',
      heroTitle: 'Energy Grid Control',
      heroDesc: 'Watch generation, storage, outages, and field crews from a single mission board.',
      metricSector: 'Critical utilities',
      metricRegion: regionKey,
      metricStatus: 'Stable',
      metricCoverage: 'Grid & substations',
      intelligenceTitle: 'Grid awareness',
      commands: ['Balance load', 'Escalate faults', 'Protect substations', 'Coordinate crews'],
      intelligence: ['Grid telemetry', 'Fault detection', 'Resource allocation', 'Weather impact']
    },
    transport: {
      name: 'Transport',
      title: 'Seven-OS Transport Dashboard',
      subtitle: 'Logistics, mobility, and route supervision translated into one shared layer.',
      heroTitle: 'Transport Network',
      heroDesc: 'Watch fleet flows, route hazards, and public movement signals in real time.',
      metricSector: 'Mobility',
      metricRegion: regionKey,
      metricStatus: 'Flowing',
      metricCoverage: 'Roads & corridors',
      intelligenceTitle: 'Mobility oversight',
      commands: ['Reroute assets', 'Alert dispatch', 'Sequence deliveries', 'Map incidents'],
      intelligence: ['Route health', 'Traffic pulse', 'Fleet status', 'Critical chokepoints']
    },
    safety: {
      name: 'Public Safety',
      title: 'Seven-OS Safety Dashboard',
      subtitle: 'Emergency response and resilience workflows unified behind one operating surface.',
      heroTitle: 'Public Safety Command',
      heroDesc: 'Coordinate rescue, medical, infrastructure, and communications response from one control point.',
      metricSector: 'Resilience',
      metricRegion: regionKey,
      metricStatus: 'Prepared',
      metricCoverage: 'Emergency zones',
      intelligenceTitle: 'Incident intelligence',
      commands: ['Trigger alerts', 'Assign units', 'Coordinate shelters', 'Publish status'],
      intelligence: ['Incident map', 'Medical triage', 'Shelter capacity', 'Communications status']
    }
  };

  const preset = presets[sectorKey] || presets.global;

  const titleEl = document.getElementById('dashboard-title');
  const subtitleEl = document.getElementById('dashboard-subtitle');
  const sectorPillEl = document.getElementById('sector-pill');
  const heroTitleEl = document.getElementById('hero-sector-name');
  const heroDescEl = document.getElementById('hero-sector-desc');
  const metricSectorEl = document.getElementById('metric-sector');
  const metricRegionEl = document.getElementById('metric-region');
  const metricStatusEl = document.getElementById('metric-status');
  const metricCoverageEl = document.getElementById('metric-coverage');
  const intelTitleEl = document.getElementById('sector-intelligence-title');
  const commandListEl = document.getElementById('command-list');
  const intelligenceListEl = document.getElementById('intelligence-list');

  if (titleEl) titleEl.textContent = preset.title;
  if (subtitleEl) subtitleEl.textContent = preset.subtitle;
  if (sectorPillEl) sectorPillEl.textContent = `Sector: ${preset.name}`;
  if (heroTitleEl) heroTitleEl.textContent = preset.heroTitle;
  if (heroDescEl) heroDescEl.textContent = preset.heroDesc;
  if (metricSectorEl) metricSectorEl.textContent = preset.metricSector;
  if (metricRegionEl) metricRegionEl.textContent = preset.metricRegion;
  if (metricStatusEl) metricStatusEl.textContent = preset.metricStatus;
  if (metricCoverageEl) metricCoverageEl.textContent = preset.metricCoverage;
  if (intelTitleEl) intelTitleEl.textContent = preset.intelligenceTitle;

  if (commandListEl) {
    commandListEl.innerHTML = preset.commands.map(item => `<li>${item}</li>`).join('');
  }

  if (intelligenceListEl) {
    intelligenceListEl.innerHTML = preset.intelligence.map(item => `<li>${item}</li>`).join('');
  }

  document.documentElement.setAttribute('data-sector', sectorKey);
})();
