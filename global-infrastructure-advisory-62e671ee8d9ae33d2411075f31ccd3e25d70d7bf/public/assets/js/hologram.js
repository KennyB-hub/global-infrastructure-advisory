// Minimal Three.js hologram stub.
// Assumes <script src="https://unpkg.com/three@0.160.0/build/three.min.js"></script> is loaded.

export function initHologram(canvasId) {
  const canvas = document.getElementById(canvasId);
  if (!canvas || !window.THREE) return;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true });
  renderer.setSize(canvas.clientWidth, canvas.clientHeight);

  const geometry = new THREE.SphereGeometry(1, 32, 32);
  const material = new THREE.PointsMaterial({ color: 0x38bdf8, size: 0.04 });
  const points = new THREE.Points(geometry, material);
  scene.add(points);

  camera.position.z = 3;

  function animate() {
    requestAnimationFrame(animate);
    points.rotation.y += 0.002;
    renderer.render(scene, camera);
  }

  animate();
}
