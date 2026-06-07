export function checkMisconduct(data) {
  const issues = [];

  const dot = data.dot?.data || {};

  if (dot.reportsFiled && dot.reportsMissing) {
    issues.push({
      type: "reporting_inconsistency",
      severity: "medium",
      message: "DOT reporting inconsistent with field data."
    });
  }

  return issues;
}
