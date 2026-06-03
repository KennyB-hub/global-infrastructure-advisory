// V12 Alpha – Task registry: what 7 of 9 is allowed to do

import { Task } from "./task-queue";
import { matchHaulersForLoad } from "../../ai/load-matching-engine.js";
import { listLoads, updateLoadStatus } from "../../ai/load-registry.js";

type TaskHandler = (task: Task) => Promise<void>;

const handlers: Record<string, TaskHandler> = {
  // Auto-match open loads to haulers
  "cattle-load-auto-match": async (task: Task) => {
    const loads = listLoads().filter(l => l.status === "open");
    for (const load of loads) {
      const result = matchHaulersForLoad(load.id);
      // simple rule: if we have at least one match, mark as "matched"
      if (result.matches && result.matches.length > 0) {
        updateLoadStatus(load.id, "matched");
      }
    }
  },

  // Example: future doc generation, compliance prep, etc.
  // "gov-compliance-auto-pack": async (task: Task) => { ... }
};

export function getTaskHandler(type: string): TaskHandler | null {
  return handlers[type] || null;
}

import { scanRepo } from "./repo-scan";
import { analyzeRepo } from "./repo-analyze";
import fs from "fs";

handlers["repo-scan"] = async () => {
  const structure = scanRepo();
  fs.writeFileSync("data/repo-structure.json", JSON.stringify(structure, null, 2));
};

handlers["repo-analyze"] = async () => {
  const structure = JSON.parse(fs.readFileSync("data/repo-structure.json", "utf8"));
  const analysis = analyzeRepo(structure);
  fs.writeFileSync("data/repo-suggestions.json", JSON.stringify(analysis, null, 2));
};

handlers["expand-sectors"] = async (task) => {
  const manifest = JSON.parse(fs.readFileSync("data/global-manifest.json", "utf8"));
  const sectors = manifest.sectors || [];

  for (const sector of sectors) {
    if (!sector.id) continue;

    const folder = `data/sectors/${sector.id}`;
    if (!fs.existsSync(folder)) {
      fs.mkdirSync(folder, { recursive: true });

      const template = {
        id: sector.id,
        label: sector.label || sector.title || sector.id,
        category: sector.category || "general",
        description: sector.description || "",
        features: sector.features || [],
        createdAt: new Date().toISOString(),
        status: "draft",
        workflows: [],
        compliance: [],
        ux: [],
        ai: []
      };

      fs.writeFileSync(`${folder}/sector.json`, JSON.stringify(template, null, 2));
      fs.writeFileSync(`${folder}/workflows.json`, JSON.stringify([], null, 2));
      fs.writeFileSync(`${folder}/compliance.json`, JSON.stringify([], null, 2));
      fs.writeFileSync(`${folder}/ux-rules.ts`, "// UX rules placeholder\n");
      fs.writeFileSync(`${folder}/ai-engine.ts`, "// AI engine placeholder\n");
    }
  }
};

handlers["generate-workflows"] = async () => {
  const manifest = JSON.parse(fs.readFileSync("data/global-manifest.json", "utf8"));
  const sectors = manifest.sectors || [];

  for (const sector of sectors) {
    if (!sector.id) continue;

    const folder = `data/sectors/${sector.id}`;
    const file = `${folder}/workflows.json`;

    const workflows = generateWorkflowsForSector(sector);

    fs.writeFileSync(file, JSON.stringify(workflows, null, 2));
  }
};

handlers["generate-ux-rules"] = async () => {
  const manifest = JSON.parse(fs.readFileSync("data/global-manifest.json", "utf8"));
  const sectors = manifest.sectors || [];

  for (const sector of sectors) {
    if (!sector.id) continue;

    const folder = `data/sectors/${sector.id}`;
    const file = `${folder}/ux-rules.json`;

    const rules = generateUXRulesForSector(sector);

    fs.writeFileSync(file, JSON.stringify(rules, null, 2));
  }
};

import { generateAIEngineStubForSector } from "./ai-engine-generator";
import fs from "fs";

handlers["generate-ai-engines"] = async () => {
  const manifest = JSON.parse(fs.readFileSync("data/global-manifest.json", "utf8"));
  const sectors = manifest.sectors || [];

  for (const sector of sectors) {
    if (!sector.id) continue;

    const folder = `data/sectors/${sector.id}`;
    if (!fs.existsSync(folder)) fs.mkdirSync(folder, { recursive: true });

    const file = `${folder}/ai-engine.ts`;
    const stub = generateAIEngineStubForSector(sector);

    fs.writeFileSync(file, stub, "utf8");
  }
};
