import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export function loadCommands() {
    const commands = {}
    const base = path.join(__dirname, "..", "commands")

    for (const group of fs.readdirSync(base)) {
        const groupPath = path.join(base, group)

        for (const file of fs.readdirSync(groupPath)) {
            if (!file.endsWith(".js")) continue
            const module = await import(path.join(groupPath, file))
            commands[module.name] = module
        }
    }

    return commands
}
