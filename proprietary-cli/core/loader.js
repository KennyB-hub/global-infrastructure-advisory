import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export async function loadCommands() {
    const commands = {}
    const base = path.join(__dirname, "..", "commands")

    for (const group of fs.readdirSync(base)) {
        const groupPath = path.join(base, group)

        for (const file of fs.readdirSync(groupPath)) {
            if (!file.endsWith(".js")) continue

            const fullPath = path.join(groupPath, file)

            // Dynamic ESM import (works for Seven + CLI)
            const mod = await import(fullPath)

            // Support both default and named exports
            const command = mod.default || mod

            // Use the module's declared name OR filename
            const name = command.name || path.parse(file).name

            commands[name] = command
        }
    }

    return commands
}
