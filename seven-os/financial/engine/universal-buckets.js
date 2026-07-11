const DEFAULT_BUCKETS = {
  version: 'v1',
  groups: {
    liquidity: {
      title: 'Liquidity',
      description: 'Cash, reserve, and short-term funding',
      tags: ['cash', 'reserve', 'stablecoin', 'treasury', 'working-capital']
    },
    credit: {
      title: 'Credit & Debt',
      description: 'Loans, liabilities, and debt obligations',
      tags: ['debt', 'loan', 'liability', 'bond']
    },
    investment: {
      title: 'Investment',
      description: 'Longer-term assets and positions',
      tags: ['asset', 'position', 'investment', 'equity']
    },
    crypto: {
      title: 'Crypto',
      description: 'Digital wallets, tokens, and treasury positions',
      tags: ['crypto', 'wallet', 'token', 'stablecoin', 'dao', 'treasury']
    }
  }
};

export function createUniversalBuckets(overrides = {}) {
  return {
    ...DEFAULT_BUCKETS,
    ...overrides,
    groups: {
      ...DEFAULT_BUCKETS.groups,
      ...(overrides.groups || {})
    }
  };
}

export function bucketizeFinancialAndCrypto(items = [], schema = createUniversalBuckets()) {
  const buckets = {
    liquidity: [],
    credit: [],
    investment: [],
    crypto: [],
    totalItems: items.length
  };

  for (const item of items) {
    const kind = String(item.kind || '').toLowerCase();
    const domain = String(item.domain || '').toLowerCase();
    const name = String(item.name || item.id || 'item');
    const amount = Number(item.amount || 0);

    const entry = {
      id: item.id || `${domain}-${name}`,
      name,
      domain,
      kind,
      amount,
      metadata: item.metadata || {}
    };

    const matchesLiquidity = ['cash', 'reserve', 'treasury', 'stablecoin', 'working-capital'].includes(kind);
    const matchesCredit = ['debt', 'loan', 'liability', 'bond'].includes(kind);
    const matchesInvestment = ['asset', 'position', 'investment', 'equity'].includes(kind);
    const matchesCrypto = domain === 'crypto' || ['crypto', 'wallet', 'token', 'stablecoin', 'dao', 'treasury'].includes(kind);

    if (matchesLiquidity) buckets.liquidity.push(entry);
    if (matchesCredit) buckets.credit.push(entry);
    if (matchesInvestment) buckets.investment.push(entry);
    if (matchesCrypto) buckets.crypto.push(entry);
  }

  return buckets;
}
