export function checkContractors(data) {
  const issues = [];

  const contractors = data.dot?.contractors || [];

  for (const c of contractors) {
    if (c.paid && !c.completed) {
      issues.push({
        type: "contractor_incomplete",
        severity: "high",
        message: `Contractor ${c.name} paid but work incomplete.`
      });
    }
  }

  return issues;
}
