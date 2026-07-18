import { RoutingEngine } from "../route/routing-engine";

export class CLIRouter {
  static identity() {
    return RoutingEngine.identity;
  }

  static execute(command: string, args: any) {
    const commands = RoutingEngine.getCLIRoutes();

    if (!commands.includes(command)) {
      throw new Error(`Unknown CLI command: ${command}`);
    }

    console.log(`Executing ${command}`, args);
  }
}
