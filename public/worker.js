<script>
    async function refreshTelemetry() {
        const log = document.getElementById('agri-logs');
        const stats = document.getElementById('soil-stats');
        
        log.innerHTML += `<p class="text-white">> Initiating GIA satellite sweep...</p>`;
        
        try {
            // Connect to your Packard Worker (Deep Mind endpoint)
            const response = await fetch(
                'https://packard-1831.global-infrastructure-advisorypagedev.workers.dev/api/deep-mind',
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ query: "soil telemetry sweep" })
                }
            );

            const data = await response.json();

            // Simulated soil telemetry response
            stats.innerHTML = `
                <div class="d-flex justify-content-between"><span>Moisture:</span><span class="text-info">42%</span></div>
                <div class="d-flex justify-content-between"><span>Nitrogen:</span><span class="text-info">Optimal</span></div>
                <div class="d-flex justify-content-between"><span>Soil Temp:</span><span class="text-info">18.4°C</span></div>
            `;
            
            log.innerHTML += `<p class="text-success">> Data integrated successfully.</p>`;
            document.getElementById('sat-status').textContent = 'LINK ACTIVE';
            
        } catch (err) {
            log.innerHTML += `<p class="text-danger">> ERROR: Satellite link severed.</p>`;
        }

        log.scrollTop = log.scrollHeight;
    }

    window.onload = refreshTelemetry;
</script>

{
  "observability": {
    "enabled": false,
    "head_sampling_rate": 1,
    "logs": {
      "enabled": true,
      "head_sampling_rate": 1,
      "persist": true,
      "invocation_logs": true
    },
    "traces": {
      "enabled": true,
      "persist": true,
      "head_sampling_rate": 1
    }
  }
}
