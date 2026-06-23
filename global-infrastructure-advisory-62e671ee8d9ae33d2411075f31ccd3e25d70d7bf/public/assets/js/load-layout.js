// 2050 Space-Grade Layout Loader
document.addEventListener("DOMContentLoaded", () => {
  const headerEl = document.getElementById("header");
  const footerEl = document.getElementById("footer");

  if (headerEl) {
    headerEl.innerHTML = `
      <header class="top-nav">
        <div class="brand-block">
          <img src="/assets/branding/logos/gia-logo-dark.svg" alt="GIA" class="brand-logo">
          <span class="brand-text">GIA Intelligence Engine</span>
        </div>
        <nav class="nav-links">
          <a href="/index.html" class="nav-link">Home</a>
          <a href="/pages/sectors.html" class="nav-link">Sectors</a>
          <a href="/pages/templates-tools/additional-case.html" class="nav-link">Templates</a>
          <a href="/dashboard" class="nav-link">System Dashboard</a>
          <a href="/admin/admin-mission-control.html" class="nav-link nav-link--primary">System Active</a>
        </nav>
      </header>
    `;
  }

  if (footerEl) {
    footerEl.innerHTML = `
      <footer class="page-footer">
        <div class="footer-content">
          © 2026 Global Infrastructure Advisory — <span style="color: var(--accent-strong)">V12 Deep Mind Core</span>
        </div>
      </footer>
    `;
  }
});
