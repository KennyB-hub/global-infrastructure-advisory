export function checkFunding(data) {
  const issues = [];

  const dot = data.dot?.data || {};

  if (dot.fundingAllocated && !dot.workCompleted) {
    issues.push({
      type: "funding_without_completion",
      severity: "high",
      message: "Funding allocated but work not completed."
    });
  }

  return issues;
}
