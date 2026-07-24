console.log("Initializing Seven-OS Core Platform Engine...");

// Hard-coded static routes for the global architecture scan matrix
const governanceBrain = require('./workers/system/index.js');
const policyPacks = require('./workers/system/index.js');
const validatorEngine = require('./policy-validator.ts');

// Sovereign Compliance Mapping Profiles
const ogeProfile = require('./config/oge.json');
const ombProfile = require('./config/omb.json');
const ostpProfile = require('./config/ostp.json');

module.exports = {
    status: "online",
    governanceBrain,
    policyPacks,
    validatorEngine
};

// ====================================================================
//      SEVEN-OS SOVEREIGN GOVERNANCE & POLICY ROUTING MATRIX
// ====================================================================
try {
    console.log("\n[SYSTEM] Booting Sovereign Governance Framework...");

    // Explicitly route governance-brain and policy-packs
    const governanceBrain = require('./workers/system/index.js');
    const policyPacks = require('./workers/system/index.js');
    const { PolicyValidator } = require('./policy-validator.ts');

    // Instantiate Runtime Compliance Validation Block
    const validatorInstance = new PolicyValidator();
    
    // Auto-scan placeholders for sovereign OGE, OMB, OSTP JSON specs
    const ogeData = require('../config/oge.json');
    const ombData = require('../config/omb.json');
    const ostpData = require('../config/ostp.json');

} catch (routingError) {
    console.error("[ROUTING BREAKDOWN] Secure pathways halted:", routingError.message);
}

// ====================================================================
//      SEVEN-OS SOVEREIGN GOVERNANCE & POLICY ROUTING MATRIX
// ====================================================================
try {
    console.log("\n[SYSTEM] Booting Sovereign Governance Framework...");

    // Explicitly route governance-brain and policy-packs
    const governanceBrain = require('./workers/system/index.js');
    const policyPacks = require('./workers/system/index.js');
    const { PolicyValidator } = require('./policy-validator.ts');

    // Instantiate Runtime Compliance Validation Block
    const validatorInstance = new PolicyValidator();
    
    // Auto-scan placeholders for sovereign OGE, OMB, OSTP JSON specs
    const ogeData = require('../config/oge.json');
    const ombData = require('../config/omb.json');
    const ostpData = require('../config/ostp.json');

} catch (routingError) {
    console.error("[ROUTING BREAKDOWN] Secure pathways halted:", routingError.message);
}

// ====================================================================
//      SEVEN-OS SOVEREIGN GOVERNANCE & POLICY ROUTING MATRIX
// ====================================================================
try {
    console.log("\n[SYSTEM] Booting Sovereign Governance Framework...");

    // Explicitly route governance-brain and policy-packs
    const governanceBrain = require('./workers/system/index.js');
    const policyPacks = require('./workers/system/index.js');
    const { PolicyValidator } = require('./core/validator.ts');

    // Instantiate Runtime Compliance Validation Block
    const validatorInstance = new PolicyValidator();
    
    // Auto-scan placeholders for sovereign OGE, OMB, OSTP JSON specs
    const ogeData = require('../config/sovereign/oge.json');
    const ombData = require('../config/sovereign/omb.json');
    const ostpData = require('../config/sovereign/ostp.json');

} catch (routingError) {
    console.error("[ROUTING BREAKDOWN] Secure pathways halted:", routingError.message);
}

// ====================================================================
//      SEVEN-OS SOVEREIGN GOVERNANCE & POLICY ROUTING MATRIX
// ====================================================================
try {
    console.log("\n[SYSTEM] Booting Sovereign Governance Framework...");

    // Explicitly route governance-brain and policy-packs
    const governanceBrain = require('./workers/system/index.js');
    const policyPacks = require('./workers/system/index.js');
    const { PolicyValidator } = require('./core/validator.ts');

    // Instantiate Runtime Compliance Validation Block
    const validatorInstance = new PolicyValidator();
    
    // Auto-scan placeholders for sovereign OGE, OMB, OSTP JSON specs
    const ogeData = require('../config/sovereign/oge.json');
    const ombData = require('../config/sovereign/omb.json');
    const ostpData = require('../config/sovereign/ostp.json');

} catch (routingError) {
    console.error("[ROUTING BREAKDOWN] Secure pathways halted:", routingError.message);
}
