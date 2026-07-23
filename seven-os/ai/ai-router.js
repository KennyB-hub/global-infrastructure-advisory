if (fs.existsSync(path.join(sevenOSRoot, "node_modules"))) {
  throw new Error("Forbidden: node_modules detected inside seven-os");
}
