// TOP SECURITY: Move these to Azure Environment Variables
const API_URL = '/api/get-opportunities'; // Proxy this through Azure Functions

const state = { all: [], filtered: [] };
const els = {
    container: document.getElementById('opportunities-container'),
    empty: document.getElementById('empty-state'),
    status: document.getElementById('status-message'),
    type: document.getElementById('filter-type'),
    region: document.getElementById('filter-region'),
    program: document.getElementById('filter-program'),
    search: document.getElementById('filter-search')
};

// Listeners for real-time filtering
[els.type, els.region, els.program, els.search].forEach(el => {
    el.addEventListener('change', applyFilters);
    if(el === els.search) el.addEventListener('input', applyFilters);
});

async function fetchOpportunities() {
    els.status.textContent = 'Verifying connection...';
    try {
        const res = await fetch(API_URL);
        if (!res.ok) throw new Error('Security Verification Failed');
        const data = await res.json();
        state.all = Array.isArray(data) ? data : [];
        applyFilters();
        els.status.textContent = `Live Connection Active: ${state.all.length} opportunities.`;
    } catch (err) {
        els.status.textContent = 'Secure Connection Error. Please refresh.';
    }
}

function renderCards() {
    els.container.innerHTML = '';
    if (!state.filtered.length) {
        els.empty.classList.remove('hidden');
        return;
    }
    els.empty.classList.add('hidden');

    state.filtered.forEach(item => {
        const card = document.createElement('article');
        card.className = 'bg-white rounded-lg shadow-sm p-5 flex flex-col justify-between';

        // TOP SECURITY: Use a helper to prevent XSS (no innerHTML on API data)
        const title = document.createElement('h3');
        title.className = 'text-lg font-semibold text-slate-900 mb-1';
        title.textContent = item.title || 'Untitled Opportunity';

        const info = document.createElement('p');
        info.className = 'text-xs text-slate-500 mb-3';
        info.textContent = `${item.program || 'N/A'} · ${item.region || 'N/A'}`;

        card.appendChild(title);
        card.appendChild(info);
        // ... append other elements using textContent ...
        
        els.container.appendChild(card);
    });
}
