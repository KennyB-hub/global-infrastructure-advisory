import { runDoctor } from "../../../tools/doctor.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function run() {
  const projectRoot = path.join(__dirname, "../../../");
  const report = runDoctor(projectRoot);

  if (!report.ok) {
    console.error("Seven‑OS logic integrity FAILED:");
    report.errors.forEach(e => console.error(" -", e));
    process.exitCode = 1;
  } else {
    console.log("Seven‑OS logic integrity OK (TS compile clean).");
  }
}
