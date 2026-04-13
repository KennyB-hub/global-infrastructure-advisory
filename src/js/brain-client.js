async function sendGiaQuery() {
    const input = document.getElementById('user-input');
    const out = document.getElementById('chat-window');
    const query = input.value.trim();

    if (!query) return;

    // Show query + loading state
    out.innerHTML += '<div class="query-line">> QUERY: ' + query + '</div>';
    out.innerHTML += '<div id="loading" class="sys-line">> GIA_SYS: Accessing Global Hub...</div>';
    
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

        out.innerHTML += '<div class="ai-line">> GIA_AI: ' + result.response + '</div>';
        out.scrollTop = out.scrollHeight;

    } catch (err) {
        const loading = document.getElementById('loading');
        if (loading) loading.innerText = "> GIA_SYS: Connection Error";
        console.error(err);
    }
}
