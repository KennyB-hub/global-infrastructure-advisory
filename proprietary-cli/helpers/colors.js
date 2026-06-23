export const green = (t) => `\x1b[32m${t}\x1b[0m`
export const red = (t) => `\x1b[31m${t}\x1b[0m`
export const yellow = (t) => `\x1b[33m${t}\x1b[0m`

const chalk = require("chalk");

module.exports = {
  success(text) {
    return chalk.green(text);
  },
  warn(text) {
    return chalk.yellow(text);
  },
  error(text) {
    return chalk.red(text);
  },
  info(text) {
    return chalk.blue(text);
  }
};
