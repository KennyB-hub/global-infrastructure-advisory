async function sendGiaQuery() {
    const input = document.getElementById('user-input');
    const out = document.getElementById('chat-window');
    const query = input.value.trim();

    if (!query) return;

    // Show query + loading state
    const queryLine = document.createElement('div');
    queryLine.className = 'query-line';
    queryLine.textContent = '> QUERY: ' + query;
    out.appendChild(queryLine);

    const loadingLine = document.createElement('div');
    loadingLine.id = 'loading';
    loadingLine.className = 'sys-line';
    loadingLine.textContent = '> GIA_SYS: Accessing Global Hub...';
    out.appendChild(loadingLine);
    
    input.value = "";
    out.scrollTop = out.scrollHeight;

    try {
        const response = await fetch('https://packard-1831.kennybennett11477.workers.dev', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query })
        });

        const result = await response.json();

        const loading = document.getElementById('loading');
        if (loading) loading.remove();

        const aiLine = document.createElement('div');
        aiLine.className = 'ai-line';
        aiLine.textContent = '> GIA_AI: ' + result.response;
        out.appendChild(aiLine);
        out.scrollTop = out.scrollHeight;

    } catch (err) {
        const loading = document.getElementById('loading');
        if (loading) loading.innerText = "> GIA_SYS: Connection Error";
        console.error(err);
    }
}
