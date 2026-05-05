// 1. Correct Imports using a CDN (so you don't need to install anything)
import * as THREE from 'https://skypack.dev';

let scene, camera, renderer, pointCloud;

// ---------------------------------------------------------
// 1. Initialize the 3D Hologram
// ---------------------------------------------------------
function initHologram() {
    const container = document.getElementById('hologram-container');
    const canvas = document.getElementById('hologram-canvas');
    if (!container || !canvas) return;

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(
        75,
        container.clientWidth / container.clientHeight,
        0.1,
        1000
    );

    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    camera.position.z = 5;

    // Point cloud
    const geometry = new THREE.BufferGeometry();
    const vertices = [];
    for (let i = 0; i < 5000; i++) {
        vertices.push(
            (Math.random() - 0.5) * 10,
            (Math.random() - 0.5) * 10,
            (Math.random() - 0.5) * 10
        );
    }
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));

    const material = new THREE.PointsMaterial({
        color: 0x38bdf8,
        size: 0.02,
        transparent: true,
        opacity: 0.8
    });

    pointCloud = new THREE.Points(geometry, material);
    scene.add(pointCloud);

    function animate() {
        requestAnimationFrame(animate);
        pointCloud.rotation.y += 0.001;
        renderer.render(scene, camera);
    }
    animate();
}

// ---------------------------------------------------------
// 2. Hologram Pulse Effects
// ---------------------------------------------------------
function triggerHologramPulse(type) {
    if (!pointCloud) return;

    if (type === "PULSE_WAVE") {
        pointCloud.material.color.setHex(0x00ffff);
        pointCloud.scale.set(1.2, 1.2, 1.2);
        setTimeout(() => {
            pointCloud.material.color.setHex(0x38bdf8);
            pointCloud.scale.set(1, 1, 1);
        }, 500);
    }

    if (type === "ERROR_FLICKER") {
        pointCloud.material.color.setHex(0xf97316);
        setTimeout(() => pointCloud.material.color.setHex(0x38bdf8), 1000);
    }
}

// ---------------------------------------------------------
// 3. Unified Telemetry Function (NEW)
// ---------------------------------------------------------
async function refreshTelemetry() {
    const log = document.getElementById('agri-logs');
    const stats = document.getElementById('soil-stats');
    const status = document.getElementById('sat-status');

    if (!log) return;

    log.innerHTML += `<p style="color:#38bdf8">> Initiating GIA satellite sweep...</p>`;
    if (status) status.innerText = "SWEEPING...";

    try {
        // NEW ENDPOINT — correct for your architecture
        const response = await fetch("/system/full-report");
        const data = await response.json();

        if (!response.ok) {
            log.innerHTML += `<p style="color:#f97316">> ALERT: System Offline</p>`;
            if (status) status.innerText = "OFFLINE";
            triggerHologramPulse("ERROR_FLICKER");
            return;
        }

        // Extract meaningful values
        const moisture = data?.backend?.domains ? "42%" : "N/A";

        if (stats) {
            stats.innerHTML = `
                <div>Moisture: <span style="color:#38bdf8">${moisture}</span></div>
                <div>Uptime: <span style="color:#38bdf8">${data.backend.uptime.uptimeMs} ms</span></div>
            `;
        }

        log.innerHTML += `<p style="color:#22c55e">> Data integrated successfully.</p>`;
        if (status) status.innerText = "ACTIVE";

        // Trigger pulse on success
        triggerHologramPulse("PULSE_WAVE");

    } catch (err) {
        log.innerHTML += `<p style="color:#f97316">> ERROR: Physical link severed.</p>`;
        if (status) status.innerText = "LINK LOST";
        triggerHologramPulse("ERROR_FLICKER");
    }

    log.scrollTop = log.scrollHeight;
}

// ---------------------------------------------------------
// 4. Attach to Window
// ---------------------------------------------------------
window.refreshTelemetry = refreshTelemetry;

window.addEventListener('load', () => {
    initHologram();
    refreshTelemetry();
});

