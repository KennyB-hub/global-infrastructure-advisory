(function () {
  async function loadDashboardData() {
    const params = new URLSearchParams(window.location.search);
    const sector = (params.get('sector') || 'global').toLowerCase();
    const region = params.get('region') || 'global';
    const payload = {
      sector,
      workflow: 'dashboard',
      priority: 'normal',
      location: { region }
    };

    try {
      const response = await fetch('/api/system/health', { cache: 'no-store' });
      const status = response.ok ? 'Operational' : 'Degraded';
      document.getElementById('metric-status').textContent = status;
    } catch (err) {
      document.getElementById('metric-status').textContent = 'Offline';
    }

    try {
      const res = await fetch('/api/system/uptime', { cache: 'no-store' });
      const data = await res.json();
      if (document.getElementById('metric-coverage')) {
        document.getElementById('metric-coverage').textContent = data?.uptimeMs ? `${Math.round(data.uptimeMs / 1000)}s` : 'Live';
      }
    } catch (err) {
      console.warn('Uptime endpoint unavailable', err);
    }

    const sectorName = sector === 'global' ? 'Universal OS' : sector;
    if (document.getElementById('metric-sector')) {
      document.getElementById('metric-sector').textContent = sectorName;
    }
    if (document.getElementById('metric-region')) {
      document.getElementById('metric-region').textContent = region;
    }
  }

  window.addEventListener('load', loadDashboardData);
})();
