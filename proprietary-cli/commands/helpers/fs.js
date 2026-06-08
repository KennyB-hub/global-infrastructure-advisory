import fs from "fs"

export const read = (p) => fs.readFileSync(p, "utf8")
export const write = (p, data) => fs.writeFileSync(p, data)
export const exists = (p) => fs.existsSync(p)
