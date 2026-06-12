import { InfrastructureAuditEngine } from '../seven-runtme/infrastructure/infrastructure-audit-engine.js';

async function main() {
  try {
    console.log('Starting infrastructure audit for target: test-sector');
    const result = await InfrastructureAuditEngine.runAudit('test-sector', {});
    console.log('Audit result summary:');
    console.log(JSON.stringify({ target: result.target, score: result.score || null, hazards: (result.hazards || []).length }, null, 2));
    // Print full output size and keys
    console.log('Result keys:', Object.keys(result));
  } catch (err) {
    console.error('Audit run failed:', err);
    process.exit(1);
  }
}

main();
