import assert from 'node:assert/strict';
import { buildWorkforcePayrollSummary } from '../public/assets/js/dashboard-data-model.js';

const sample = {
  people: [
    { id: 'p1', name: 'Ada', role: 'Engineer', type: 'employee', status: 'active' },
    { id: 'p2', name: 'Lin', role: 'Field Ops', type: 'staff', status: 'active' },
    { id: 'p3', name: 'Moe', role: 'Contractor', type: 'contractor', status: 'pending' }
  ],
  payrollRuns: [
    { id: 'run-1', total: 12000, status: 'completed' },
    { id: 'run-2', total: 9000, status: 'queued' }
  ]
};

const summary = buildWorkforcePayrollSummary(sample);
assert.equal(summary.employeeCount, 3, 'expected total people count');
assert.equal(summary.activeCount, 2, 'expected active workforce count');
assert.equal(summary.payrollRunCount, 2, 'expected payroll run count');
assert.equal(summary.latestPayrollTotal, 12000, 'expected latest payroll total');
assert.equal(summary.status, 'queued', 'expected latest status');

console.log('dashboard data model ok');
console.log(JSON.stringify(summary, null, 2));
