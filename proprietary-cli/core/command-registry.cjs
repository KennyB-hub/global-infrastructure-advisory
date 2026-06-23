const { loadInternalCommands } = require("./load-command");
const { loadNodeModulesCommands } = require("./load-node-modules-commands.cjs");

function buildCommandRegistry() {
  const internal = loadInternalCommands();
  const external = loadNodeModulesCommands();

  return {
    ...internal,
    ...external
  };
}

module.exports = { buildCommandRegistry };
