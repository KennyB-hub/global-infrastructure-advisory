// integration-map-loader.ts
import integrationMapJson from '../system/integration-map.json';

export async function loadIntegrationMap() {
  // could add schema validation here
  return integrationMapJson;
}
