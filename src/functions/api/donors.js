export async function listDonors(env) {
  const stmt = await env.DB.prepare("SELECT * FROM donors");
  const { results } = await stmt.all();
  return results;
}
