// 1. Correct Imports using a CDN (so you don't need to install anything)
import * as THREE from 'https://skypack.dev';

let scene, camera, renderer, pointCloud;

// 2. Initialize the 3D Hologram
function initHologram() {
    const container = document.getElementById('hologram-container');
    const canvas = document.getElementById('hologram-canvas');
    if (!container || !canvas) return;

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
    
    renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    camera.position.z = 5;

    // Create a Point Cloud (Satellite Data visualization)
    const geometry = new THREE.BufferGeometry();
    const vertices = [];
    for (let i = 0; i < 5000; i++) {
        vertices.push((Math.random() - 0.5) * 10, (Math.random() - 0.5) * 10, (Math.random() - 0.5) * 10);
    }
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    
    const material = new THREE.PointsMaterial({ color: 0x38bdf8, size: 0.02, transparent: true, opacity: 0.8 });
    pointCloud = new THREE.Points(geometry, material);
    scene.add(pointCloud);

    function animate() {
        requestAnimationFrame(animate);
        pointCloud.rotation.y += 0.001; // Slow orbit rotation
        renderer.render(scene, camera);
    }
    animate();
}

// 3. The Telemetry Function (Fixed to work with your button)
async function refreshTelemetry() {
    const log = document.getElementById('agri-logs');
    const stats = document.getElementById('soil-stats');
    const status = document.getElementById('sat-status');

    if (!log) return;

    log.innerHTML += `<p style="color: #38bdf8">> Initiating GIA satellite sweep...</p>`;
    if(status) status.innerText = "SWEEPING...";

    try {
        const response = await fetch('/api/deep-mind', {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ query: "soil telemetry sweep" })
        });
        const data = await response.json();

        if (!response.ok) {
            log.innerHTML += `<p style="color: #f97316">> ALERT: ${data.result || 'System Offline'}</p>`;
            if(status) status.innerText = "OFFLINE";
        } else {
            if(stats) stats.innerHTML = `<div>Moisture: <span style="color:#38bdf8">42%</span></div>`;
            log.innerHTML += `<p style="color: #22c55e">> Data integrated successfully.</p>`;
            if(status) status.innerText = "ACTIVE";
            
            // Visual feedback: Make the hologram flash on success
            pointCloud.material.color.setHex(0x22c55e); 
            setTimeout(() => pointCloud.material.color.setHex(0x38bdf8), 1000);
        }
    } catch (err) {
        log.innerHTML += `<p style="color: #f97316">> ERROR: Physical link severed.</p>`;
        if(status) status.innerText = "LINK LOST";
    }
    log.scrollTop = log.scrollHeight;
}

// 4. Attach to Window so the HTML button can "see" the function
window.refreshTelemetry = refreshTelemetry;
window.addEventListener('load', () => {
    initHologram();
    refreshTelemetry();
});

// 5. Function to create the "Holographic Pulse"
function triggerHologramPulse(type) {
    if (!pointCloud) return;

    if (type === "PULSE_WAVE") {
        // Flash the color to bright cyan
        pointCloud.material.color.setHex(0x00ffff);
        pointCloud.scale.set(1.2, 1.2, 1.2); // Quickly expand

        // Smoothly return to normal
        setTimeout(() => {
            pointCloud.material.color.setHex(0x38bdf8);
            pointCloud.scale.set(1, 1, 1);
        }, 500);
    } else if (type === "ERROR_FLICKER") {
        // Red flicker for system errors
        pointCloud.material.color.setHex(0xf97316);
        setTimeout(() => pointCloud.material.color.setHex(0x38bdf8), 1000);
    }
}

// 6. Update your existing refreshTelemetry function to call the pulse
async function refreshTelemetry() {
    // ... your existing fetch code ...
    const data = await response.json();
    
    if (response.ok) {
        // This is the link!
        triggerHologramPulse(data.visual_trigger); 
        
        // Update the UI text
        document.getElementById('soil-stats').innerHTML = `Moisture: ${data.moisture}`;
    }
}
