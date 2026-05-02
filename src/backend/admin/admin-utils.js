// /backend/admin/admin-utils.js
export class AdminUtils {
  display(id, data) {
    const el = document.getElementById(id);
    if (!el) return;

    if (typeof data === "object") {
      el.innerText = JSON.stringify(data, null, 2);
    } else {
      el.innerText = data;
    }
  }
}
