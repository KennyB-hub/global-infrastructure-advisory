export const name = "run-workflow"

export function run(args) {
    const workflow = args[0]
    console.log(`Executing workflow: ${workflow}`)
}
