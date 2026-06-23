// Simple unified nav builder; you can evolve this later.
export function buildNav(container, config) {
  const { items, role } = config;

  container.innerHTML = items
    .map((item) => {
      if (item.href) {
        return `<a class="nav-link" href="${item.href}">${item.label}</a>`;
      }
      return `<a class="nav-link" href="#" id="${item.id}">${item.label}</a>`;
    })
    .join("") +
    `<a class="nav-link nav-link--primary" href="/public/auth/login.html">${role}</a>`;
}
