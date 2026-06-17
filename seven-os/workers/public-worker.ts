/**
 * Public Worker Root (TypeScript)
 * Seven‑OS System Workers
 */

import { registerWorkerDomain } from "../../worker";
import * as EmployeeWorker from "./employee";
import * as HRWorker from "./hr-worker";
import * as PayrollWorker from "./payroll-worker";

export const PUBLIC_WORKER_ID = "public-worker";

export const publicWorkerCapabilities = {
  id: PUBLIC_WORKER_ID,
  roles: ["public", "employee", "hr", "payroll"],
  workers: {
    employee: EmployeeWorker,
    hr: HRWorker,
    payroll: PayrollWorker,
  },
};

registerWorkerDomain({
  id: PUBLIC_WORKER_ID,
  description: "Public-facing worker domain for Seven‑OS",
  capabilities: publicWorkerCapabilities,
  routes: {
    employee: EmployeeWorker.routes,
    hr: HRWorker.routes,
    payroll: PayrollWorker.routes,
  },
});

export default publicWorkerCapabilities;
