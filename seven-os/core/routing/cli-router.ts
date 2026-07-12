import { RoutingEngine } from "./routing-engine";

export class CLIRouter {
  static listCommands() {
    return RoutingEngine.getCLIRoutes();
  }

  static execute(command: string, args: any) {
    const commands = RoutingEngine.getCLIRoutes();

    if (!commands.includes(command)) {
      throw new Error(`Unknown CLI command: ${command}`);
    }

    console.log(`Executing ${command}`, args);
  }
}
