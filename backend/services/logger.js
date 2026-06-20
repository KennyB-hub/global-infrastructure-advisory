// Simple enterprise-style logger for proprietary CLI

const chalk = require("chalk");

function stamp() {
  return new Date().toISOString();
}

module.exports = {
  start(commandName) {
    console.log(chalk.cyan(`[${stamp()}] ▶ START ${commandName}`));
  },

  success(commandName) {
    console.log(chalk.green(`[${stamp()}] ✅ DONE ${commandName}`));
  },

  info(message) {
    console.log(chalk.blue(`[${stamp()}] ℹ ${message}`));
  },

  warn(message) {
    console.log(chalk.yellow(`[${stamp()}] ⚠ ${message}`));
  },

  error(commandName, err) {
    console.error(chalk.red(`[${stamp()}] ❌ ERROR in ${commandName}`));
    console.error(chalk.red(err && err.stack ? err.stack : err));
  }
};
