export function buildContractorDashboard({ contractor, jobs }) {
  const assigned = jobs.filter(j => j.contractor_id === contractor.id);
  return {
    contractorId: contractor.id,
    activeJobs: assigned.filter(j => j.status === "active"),
    completedJobs: assigned.filter(j => j.status === "completed")
  };
}
