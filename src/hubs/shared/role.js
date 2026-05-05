export function getRole() {
  return localStorage.getItem("gia_role") || "public";
}
