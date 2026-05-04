const API_URL = '/api/opportunities';

async function fetchOpportunities() {
    const res = await fetch(API_URL);
    return await res.json();
}
