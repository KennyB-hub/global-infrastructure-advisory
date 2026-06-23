import fs from "fs"

export const read = (p) => fs.readFileSync(p, "utf8")
export const write = (p, data) => fs.writeFileSync(p, data)
export const exists = (p) => fs.existsSync(p)

const fs = require("fs");
const path = require("path");

module.exports = {
  exists(p) {
    return fs.existsSync(p);
  },

  readJSON(p) {
    return JSON.parse(fs.readFileSync(p, "utf8"));
  },

  writeJSON(p, data) {
    fs.writeFileSync(p, JSON.stringify(data, null, 2));
  },

  resolve(...parts) {
    return path.resolve(...parts);
  }
};
