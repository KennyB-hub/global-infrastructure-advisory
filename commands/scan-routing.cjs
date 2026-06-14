import path from "path";
import { scanRouting } from "../seven-os/system/indexer/routing-scanner.js";

const repoRoot = path.resolve(__dirname, "..");
const issues = scanRouting(repoRoot);

if (!issues.length) {
  console.log("✅ Routing is clean.");
} else {
  console.log(`⚠ Found ${issues.length} routing issues:`);
  for (const issue of issues) {
    console.log(JSON.stringify(issue, null, 2));
  }
}
