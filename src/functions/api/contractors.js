export async function listContractors(env) {
  const stmt = await env.DB.prepare("SELECT * FROM contractors");
  const { results } = await stmt.all();
  return results;
}
