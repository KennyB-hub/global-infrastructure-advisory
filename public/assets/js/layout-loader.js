async function loadLayout() {
    const headerEl = document.getElementById("header");
    const footerEl = document.getElementById("footer");

    if (headerEl) {
        const header = await fetch("/assets/components/header.html");
        headerEl.innerHTML = await header.text();
    }

    if (footerEl) {
        const footer = await fetch("/assets/components/footer.html");
        footerEl.innerHTML = await footer.text();
    }
}

loadLayout();
