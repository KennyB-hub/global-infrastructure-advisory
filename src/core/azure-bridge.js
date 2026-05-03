// src/core/azure-bridge.js
export async function fetchSectorData(sectorId, env) {
    // Securely calling your Azure Function or Logic App
    const response = await fetch(`https://azurewebsites.net{sectorId}`, {
        headers: {
            'x-functions-key': env.AZURE_FUNCTION_KEY, // Stored in Cloudflare Secrets
            'Authorization': `Bearer ${env.AZURE_AD_TOKEN}`
        }
    });
    return await response.json();
}
