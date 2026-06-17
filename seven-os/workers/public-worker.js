/**
 * Public Worker Root (JavaScript)
 * Seven‑OS System Workers
 */

const { registerWorkerDomain } = require("../../worker");
const EmployeeWorker = require("./employee");
const HRWorker = require("./hr-worker");
const PayrollWorker = require("./payroll-worker");

const PUBLIC_WORKER_ID = "public-worker";

const publicWorkerCapabilities = {
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

module.exports = publicWorkerCapabilities;
