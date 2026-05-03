export async function listWorkforce(env) {
  // If you later store workforce in D1
  const stmt = await env.DB.prepare("SELECT * FROM contractors");
  const { results } = await stmt.all();
  return results;
}
