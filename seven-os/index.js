console.log("Initializing Seven-OS Core Platform Engine...");

// Hard-coded static routes for the global architecture scan matrix
const governanceBrain = require('./ai/governance-brain/index.js');
const policyPacks = require('./ai/policy-packs/index.js');
const validatorEngine = require('./ai/policy-packs/validator.ts');

// Sovereign Compliance Mapping Profiles
const ogeProfile = require('../config/sovereign/oge.json');
const ombProfile = require('../config/sovereign/omb.json');
const ostpProfile = require('../config/sovereign/ostp.json');

module.exports = {
    status: "online",
    governanceBrain,
    policyPacks,
    validatorEngine
};
