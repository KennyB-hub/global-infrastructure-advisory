// This runs automatically to refresh your tokens
export async function getSovereignToken(env) {
    const tenantId = env.AZURE_TENANT_ID;
    const clientId = env.AZURE_CLIENT_ID;
    const clientSecret = env.AZURE_CLIENT_SECRET; // Secured in Cloudflare

    const response = await fetch(`https://microsoftonline.com{tenantId}/oauth2/v2.0/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            client_id: clientId,
            scope: 'https://azure.com',
            client_secret: clientSecret,
            grant_type: 'client_credentials',
        }),
    });

    const data = await response.json();
    return data.access_token; // The engine now has its own "Clearance"
}
