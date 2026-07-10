// payroll-calc.js — V12 Alpha Stable
// Core payroll engine used by Payroll Hub + AccountantAI + BankerAI

export function calculatePayroll(record) {
  // record = {
  //   hours,
  //   rate,
  //   overtimeRate,
  //   overtimeHours,
  //   benefits,
  //   taxes,
  //   currency
  // }

  const base = record.hours * record.rate;
  const overtime = (record.overtimeHours || 0) * (record.overtimeRate || record.rate * 1.5);

  const gross = base + overtime;

  const taxAmount = gross * (record.taxes || 0);
  const benefitsAmount = record.benefits || 0;

  const net = gross - taxAmount - benefitsAmount;

  return {
    base,
    overtime,
    gross,
    taxAmount,
    benefitsAmount,
    net,
    currency: record.currency || "USD"
  };
}

