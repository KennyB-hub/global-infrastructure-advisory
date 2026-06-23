// /backend/admin/dashboard.js
import { AdminAPI } from "./admin-api.js";
import { AdminUtils } from "./admin-utils.js";

const api = new AdminAPI();
const utils = new AdminUtils();

document.getElementById("checkHealth").onclick = async () => {
  const res = await api.health();
  utils.display("status", res);
};

document.getElementById("testCortex").onclick = async () => {
  const res = await api.testCortex();
  utils.display("status", res);
};
