export function safeShell(command, allowed = []) {
    if (!allowed.includes(command)) {
        return {
            error: "Command not allowed",
            command,
            status: "denied"
        };
    }

    return {
        command,
        status: "ok"
    };
}
