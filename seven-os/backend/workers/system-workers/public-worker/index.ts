/**
 * Public Worker Root
 * Seven‑OS System Workers
 *
 * This file registers the public‑worker domain and exposes
 * all sub‑workers (employee, hr, payroll) under one unified
 * public-facing worker namespace.
 */

import { registerWorkerDomain } from "../../worker";
import * as EmployeeWorker from "./employee";
import * as HRWorker from "./hr-worker";
import * as PayrollWorker from "./payroll-worker";

export const PUBLIC_WORKER_ID = "public-worker";

// Unified capability map
export const publicWorkerCapabilities = {
  id: PUBLIC_WORKER_ID,
  roles: ["public", "employee", "hr", "payroll"],
  workers: {
    employee: EmployeeWorker,
    hr: HRWorker,
    payroll: PayrollWorker,
  },
};

// Register with Seven‑OS worker registry
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

// Export unified interface
export default publicWorkerCapabilities;
