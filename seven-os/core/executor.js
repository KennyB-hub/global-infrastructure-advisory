export function execute(args, registry) {
    const [command, ...rest] = args

    if (!registry[command]) {
        console.error(`Unknown command: ${command}`)
        process.exit(1)
    }

    registry[command].run(rest)
}
