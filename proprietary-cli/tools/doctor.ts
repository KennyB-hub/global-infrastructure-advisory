import ts from "typescript";
import fs from "fs";
import path from "path";

interface LogicIntegrityReport {
  ok: boolean;
  errors: string[];
}

export function runDoctor(projectRoot: string): LogicIntegrityReport {
  const configPath = path.join(projectRoot, "tsconfig.json");
  const configFile = ts.readConfigFile(configPath, ts.sys.readFile);

  const parsed = ts.parseJsonConfigFileContent(
    configFile.config,
    ts.sys,
    projectRoot
  );

  const program = ts.createProgram({
    rootNames: parsed.fileNames,
    options: parsed.options
  });

  const diagnostics = ts.getPreEmitDiagnostics(program);
  const errors = diagnostics.map(d =>
    ts.flattenDiagnosticMessageText(d.messageText, "\n")
  );

  return {
    ok: errors.length === 0,
    errors
  };
}
