// run-incident-scan.js
// V12 Alpha – CLI Incident Scan Runner

const { openIncidentsFromAlerts } = require("../ai/incident-response-workflow");

(async () => {
  console.log("🔍 Running Security Incident Scan...");

  try {
    const incidents = openIncidentsFromAlerts();

    console.log(`\n📌 Incidents Created: ${incidents.length}\n`);

    incidents.forEach((inc) => {
      console.log(`— ${inc.id} | ${inc.severity.toUpperCase()} | ${inc.type}`);
      console.log(`   Template: ${inc.templateId || "N/A"}`);
      console.log(`   Message: ${inc.message}`);
      console.log(`   Status: ${inc.status}`);
      console.log("");
    });

    console.log("✅ Incident scan complete.\n");
  } catch (err) {
    console.error("❌ Error running incident scan:", err.message);
  }
})();
