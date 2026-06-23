import { routeRequest } from '../seven-os/sectors/cross-sector-routing-engine.js';

(async function(){
  try {
    const req = { sector: 'infrastructure', workflow: 'repair', priority: 'normal', location: { region: 'north' } };
    const res = routeRequest(req);
    console.log('Route request result:');
    console.log(JSON.stringify(res, null, 2));
  } catch (e) {
    console.error('Route audit failed:', e);
    process.exit(1);
  }
})();
