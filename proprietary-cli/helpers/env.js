module.exports = {
  get(name, fallback = undefined) {
    return process.env[name] || fallback;
  },

  require(name) {
    const value = process.env[name];
    if (!value) {
      throw new Error(`Required env var missing: ${name}`);
    }
    return value;
  }
};
