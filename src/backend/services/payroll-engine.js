// src/backend/services/payroll-engine.js
// Payroll Engine — field employees, overtime, hazard, per diem.

export function calculatePayroll(employee, timeEntries, options = {}) {
  const baseRate = employee.rate || options.defaultRate || 0;
  const overtimeMultiplier = options.overtimeMultiplier || 1.5;
  const overtimeThreshold = options.overtimeThreshold || 40;
  const hazardBonus = options.hazardBonus || 0;
  const perDiem = options.perDiem || 0;

  let regularHours = 0;
  let overtimeHours = 0;

  for (const entry of timeEntries || []) {
    const hours = entry.hours || 0;
    regularHours += hours;
  }

  if (regularHours > overtimeThreshold) {
    overtimeHours = regularHours - overtimeThreshold;
    regularHours = overtimeThreshold;
  }

  const regularPay = regularHours * baseRate;
  const overtimePay = overtimeHours * baseRate * overtimeMultiplier;
  const hazardPay = employee.hazardEligible ? hazardBonus : 0;
  const perDiemTotal = perDiem * (options.days || 0);

  const total = regularPay + overtimePay + hazardPay + perDiemTotal;

  return {
    employeeId: employee.id,
    regularHours,
    overtimeHours,
    regularPay,
    overtimePay,
    hazardPay,
    perDiem: perDiemTotal,
    total,
    currency: options.currency || "USD"
  };
}
