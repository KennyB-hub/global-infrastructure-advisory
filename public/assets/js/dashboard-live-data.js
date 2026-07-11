(function () {
  function normalizeBucketSummary() {
    const container = document.getElementById('bucket-summary');
    if (!container) return;

    const contract = {
      id: 'mpx-phase1-base',
      title: 'Mission Phoenix Phase 1',
      ceilingAmount: 2500000,
      linkedBudgets: ['mission-phoenix-phase-1', 'mission-phoenix-agriculture-phase-1']
    };

    const budget = {
      id: 'mission-phoenix-agriculture-phase-1',
      sector: 'agriculture',
      totalBudget: 250000,
      lineItems: [
        { id: 'drone-ops', label: 'Drone Operations', allocated: 80000, actual: 0, tags: ['drone', 'ops', 'field'] },
        { id: 'infrastructure-repair', label: 'Infrastructure Repair', allocated: 120000, actual: 0, tags: ['roads', 'bridges'] }
      ]
    };

    const items = [
      { id: 'cash-001', name: 'Treasury USD', domain: 'financial', kind: 'cash', amount: Math.round(contract.ceilingAmount * 0.12) },
      { id: 'loan-001', name: 'Working Capital Loan', domain: 'financial', kind: 'debt', amount: Math.round(contract.ceilingAmount * 0.08) },
      { id: 'crypto-001', name: 'USDC Wallet', domain: 'crypto', kind: 'stablecoin', amount: 18000 },
      { id: 'crypto-002', name: 'BTC Position', domain: 'crypto', kind: 'asset', amount: 2.4 },
      { id: 'crypto-003', name: 'DAO Treasury', domain: 'crypto', kind: 'treasury', amount: 50000 },
      { id: 'budget-001', name: budget.id, domain: 'financial', kind: 'budget', amount: budget.totalBudget }
    ];

    const buckets = {
      liquidity: items.filter(item => ['cash', 'stablecoin', 'treasury', 'budget'].includes(String(item.kind).toLowerCase())),
      credit: items.filter(item => ['debt', 'loan'].includes(String(item.kind).toLowerCase())),
      investment: items.filter(item => ['asset', 'position'].includes(String(item.kind).toLowerCase())),
      crypto: items.filter(item => item.domain === 'crypto')
    };

    const cards = Object.entries(buckets).map(([bucketName, itemsForBucket]) => {
      const total = itemsForBucket.reduce((sum, item) => sum + Number(item.amount || 0), 0);
      const label = bucketName.charAt(0).toUpperCase() + bucketName.slice(1);
      return `<div class="bucket-card"><strong>${label}</strong><small>${itemsForBucket.length} items · ${total.toLocaleString()} USD</small></div>`;
    });

    container.innerHTML = cards.join('');
  }

  async function loadDashboardData() {
    const params = new URLSearchParams(window.location.search);
    const sector = (params.get('sector') || 'global').toLowerCase();
    const region = params.get('region') || 'global';

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

    normalizeBucketSummary();
  }

  window.addEventListener('load', loadDashboardData);
})();
