// /backend/services/logger.js
export class Logger {
  static info(message, data = {}) {
    console.log(JSON.stringify({ level: "info", message, ...data }));
  }

  static warn(message, data = {}) {
    console.warn(JSON.stringify({ level: "warn", message, ...data }));
  }

  static error(message, data = {}) {
    console.error(JSON.stringify({ level: "error", message, ...data }));
  }
}
