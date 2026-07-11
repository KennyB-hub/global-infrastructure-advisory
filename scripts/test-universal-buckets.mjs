import assert from 'node:assert/strict';
import { createUniversalBuckets, bucketizeFinancialAndCrypto } from '../seven-os/financial/engine/universal-buckets.js';

const sample = [
  { id: 'cash-001', name: 'Treasury USD', domain: 'financial', kind: 'cash', amount: 120000 },
  { id: 'loan-001', name: 'Working Capital Loan', domain: 'financial', kind: 'debt', amount: 90000 },
  { id: 'crypto-001', name: 'USDC Wallet', domain: 'crypto', kind: 'stablecoin', amount: 18000 },
  { id: 'crypto-002', name: 'BTC Position', domain: 'crypto', kind: 'asset', amount: 2.4 },
  { id: 'crypto-003', name: 'DAO Treasury', domain: 'crypto', kind: 'treasury', amount: 50000 }
];

const buckets = bucketizeFinancialAndCrypto(sample);
assert.ok(buckets.liquidity?.length >= 1, 'expected liquidity bucket');
assert.ok(buckets.credit?.length >= 1, 'expected credit bucket');
assert.ok(buckets.crypto?.length >= 2, 'expected crypto bucket');
assert.equal(buckets.totalItems, sample.length, 'expected total item count');
assert.equal(createUniversalBuckets().version, 'v1', 'expected bucket schema version');

console.log('universal buckets ok');
console.log(JSON.stringify(buckets, null, 2));
