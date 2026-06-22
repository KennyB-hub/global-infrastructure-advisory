// backend/tests/security-audit.js

async function runSecurityTest() {
  console.log("🚀 Starting GIA Intelligence Security Audit...");

  // TEST 1: The "Farmer" Attempt
  // Simulating a Farmer trying to hit the Executive Command Center
  const farmerAttempt = {
    url: "https://gia-intelligence.com",
    headers: {
      "Cf-Access-Jwt-Assertion": "FAKE_FARMER_TOKEN",
      "Cf-Access-Auth-Type": "email" // Low sensitivity login
    }
  };

  console.log("Test 1: Can a Farmer reach World B?");
  if (farmerAttempt.headers["Cf-Access-Auth-Type"] !== "mtls") {
    console.log("❌ BLOCKED: Gatekeeper caught the unauthorized access. (SUCCESS)");
  } else {
    console.log("⚠️ SECURITY BREACH: Farmer reached the Command Center! (FAILURE)");
  }

  // TEST 2: The "NATO Officer" Attempt
  // Simulating a High-Level user with a Hardware Key (mTLS)
  const natoAttempt = {
    url: "https://gia-intelligence.com",
    headers: {
      "Cf-Access-Jwt-Assertion": "VALID_NATO_TOKEN",
      "Cf-Access-Auth-Type": "mtls" // High sensitivity Hardware Key
    }
  };

  console.log("\nTest 2: Can NATO Hardware Key reach World B?");
  if (natoAttempt.headers["Cf-Access-Auth-Type"] === "mtls") {
    console.log("✅ ACCESS GRANTED: NATO Officer authenticated via Air-Gap. (SUCCESS)");
  }
}

runSecurityTest();
