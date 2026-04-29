export async function listOpportunities(env) {
  const stmt = await env.DB.prepare("SELECT * FROM opportunities");
  const { results } = await stmt.all();
  return results;
}
