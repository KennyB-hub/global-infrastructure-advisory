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
