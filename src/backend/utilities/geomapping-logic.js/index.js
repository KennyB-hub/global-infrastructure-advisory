const mappingLogic = require('./mapping-logic');
const distance = require('./distance');
const regionMatcher = require('./region-matcher');
const normalize = require('./normalize-location');

module.exports = {
  ...mappingLogic,
  ...distance,
  ...regionMatcher,
  ...normalize
};

const mappingLogic = require('./mapping-logic');
const distance = require('./distance');
const regionMatcher = require('./region-matcher');
const normalize = require('./normalize-location');

module.exports = {
  ...mappingLogic,
  ...distance,
  ...regionMatcher,
  ...normalize
};

// backend/utilities/geo/index.js
const { normalizeLocation } = require('./normalize-location');
const { mapLocationToContext } = require('./mapping-logic');
// ... other imports

module.exports = {
  normalizeLocation,
  mapLocationToContext,
  // ... other exports
};

/**
 * © 2026 Global Infrastructure Advisory
 * Geo Utilities Index
 */

const mappingLogic = require('./mapping-logic');
const regionMatcher = require('./region-matcher');
const normalize = require('./normalize-location');
const sectorMapping = require('./sector-mapping');

module.exports = {
  ...mappingLogic,
  ...regionMatcher,
  ...normalize,
  ...sectorMapping
};
