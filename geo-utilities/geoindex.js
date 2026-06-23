/**
 * © 2026 Global Infrastructure Advisory
 * Geo Utilities Index
 */

const mappingLogic = require('../backend/countries/data/mapping-logic');
const regionMatcher = require('../backend/countries/data/region-matcher');
const normalize = require('../backend/countries/data/normalize-location');
const sectorMapping = require('../backend/countries/data/sector-mapping');

module.exports = {
  ...mappingLogic,
  ...regionMatcher,
  ...normalize,
  ...sectorMapping
};
