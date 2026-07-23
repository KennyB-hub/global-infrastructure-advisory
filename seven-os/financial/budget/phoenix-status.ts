#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

type PhoenixBudgetLineItem = {
  id: string;
  label: string;
  allocated: number;
  actual: number;
  tags: string[];
};

type PhoenixBudget = {
  id: string;
  projectId: string;
  sector: string;
  currency: string;
  totalBudget: number;
  timeframe: { start: string; end: string };
  lineItems: PhoenixBudgetLineItem[];
};

const PHOENIX_BUDGET_PATH = path.join(
  process.cwd(),
  "seven-os",
  "financial",
  "budgets",
  "mission-phoenix.json"
);

function loadPhoenixBudget(): PhoenixBudget {
  const raw = fs.readFileSync(PHOENIX_BUDGET_PATH, "utf8");
  return JSON.parse(raw) as PhoenixBudget;
}

async function main() {
  const budget = loadPhoenixBudget();

  console.log("=== Mission Phoenix Funding Status ===");
  console.log("Project:", budget.projectId);
  console.log("Budget ID:", budget.id);
  console.log("Sector:", budget.sector);
  console.log("Currency:", budget.currency);
  console.log("Total Budget:", budget.totalBudget.toLocaleString());
  console.log("Timeframe:", budget.timeframe.start, "→", budget.timeframe.end);
  console.log("");

  console.log("Line Items:");
  for (const li of budget.lineItems) {
    const remaining = li.allocated - li.actual;
    console.log(
      `- ${li.label} [${li.id}]`
    );
    console.log(
      `  Allocated: ${li.allocated.toLocaleString()} | Actual: ${li.actual.toLocaleString()} | Remaining: ${remaining.toLocaleString()}`
    );
    console.log(`  Tags: ${li.tags.join(", ")}`);
  }
}

main();
