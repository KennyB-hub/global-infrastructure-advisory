// seven-os/system/api/company-profile.js

export async function handleCompanyProfileApi(request: Request, env: any) {
  const identity = env.companyIdentity;
  if (!identity) {
    return new Response(
      JSON.stringify({ error: "Company identity not initialized" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  const profile = identity.getProfile();

  // Optionally omit EIN from public API:
  const { ein, ...rest } = profile;

  return new Response(JSON.stringify(rest), {
    status: 200,
    headers: { "Content-Type": "application/json" }
  });
}
