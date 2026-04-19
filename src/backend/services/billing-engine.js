// src/backend/services/billing-engine.js
// Billing Engine — project billing, Davis-Bacon aware.

export function calculateInvoice(job, timeEntries, options = {}) {
  const baseRate = job.rate || options.defaultRate || 0;
  const davisBaconRate = job.davisBaconRate || baseRate;
  const useDavisBacon = job.requiresDavisBacon;

  let totalHours = 0;
  let totalAmount = 0;

  for (const entry of timeEntries || []) {
    const hours = entry.hours || 0;
    const rate = useDavisBacon ? davisBaconRate : baseRate;
    totalHours += hours;
    totalAmount += hours * rate;
  }

  return {
    jobId: job.id,
    totalHours,
    totalAmount,
    rateUsed: useDavisBacon ? "davis_bacon" : "base",
    currency: options.currency || "USD"
  };
}
