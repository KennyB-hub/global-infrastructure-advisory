// semantic-router.js
// V12 Alpha – Semantic Routing Layer

const fs = require("fs");
const path = require("path");

// Paths (adjust if needed)
const CLASSIFIERS_PATH = path.join(
  __dirname,
  "GLOBAL_CLASSIFIERS_V12_ALPHA.json"
);
const EMBEDDINGS_PATH = path.join(
  __dirname,
  "GLOBAL_EMBEDDINGS_V12_ALPHA.json"
);

// --- Load manifests ---

function loadJson(filePath) {
  const raw = fs.readFileSync(filePath, "utf8");
  return JSON.parse(raw);
}

const classifiersManifest = loadJson(CLASSIFIERS_PATH);
const embeddingsManifest = loadJson(EMBEDDINGS_PATH);

// --- Helpers to find classifiers / indexes ---

function getClassifier(name) {
  const c = classifiersManifest.classifiers.find((x) => x.name === name);
  if (!c) {
    throw new Error(`Classifier '${name}' not found in GLOBAL_CLASSIFIERS_V12_ALPHA.`);
  }
  return c;
}

function getEmbeddingIndexByTrustZone(trustZone) {
  const idx = embeddingsManifest.indexes.find((x) => x.trustZone === trustZone);
  if (!idx) {
    throw new Error(
      `No embedding index configured for trustZone '${trustZone}' in GLOBAL_EMBEDDINGS_V12_ALPHA.`
    );
  }
  return idx;
}

// --- Stub: call out to your LLM / classifier engine ---
// In production, wire this to your actual model invocation.

async function runClassifier(model, labels, inputText) {
  // Replace this with a real call to your LLM/classifier.
  // For now, naive stub: always return first label.
  return labels[0];
}

// --- Core classification steps ---

async function classifyTrustZone(inputText) {
  const classifier = getClassifier("trustZoneClassifier");
  const label = await runClassifier(
    classifier.model,
    classifier.labels,
    inputText
  );
  return label;
}

async function classifySector(inputText) {
  const classifier = getClassifier("sectorClassifier");
  const label = await runClassifier(
    classifier.model,
    classifier.labels,
    inputText
  );
  return label;
}

async function classifyDocType(inputText) {
  const classifier = getClassifier("docTypeClassifier");
  const label = await runClassifier(
    classifier.model,
    classifier.labels,
    inputText
  );
  return label;
}

async function classifyRisk(inputText) {
  const classifier = getClassifier("riskClassifier");
  const label = await runClassifier(
    classifier.model,
    classifier.labels,
    inputText
  );
  return label;
}

// --- Build semantic routing plan ---

/**
 * Build a semantic routing plan for a user query.
 * Returns a pure data object – your engines decide how to execute it.
 */
async function buildSemanticRoutingPlan(inputText, options = {}) {
  const explicitTrustZone = options.trustZone || null;

  const trustZone = explicitTrustZone || (await classifyTrustZone(inputText));
  const sector = await classifySector(inputText);
  const docType = await classifyDocType(inputText);
  const risk = await classifyRisk(inputText);

  const embeddingIndex = getEmbeddingIndexByTrustZone(trustZone);

  return {
    v12Alpha: {
      version: "12.0.0-alpha"
    },
    query: inputText,
    trustZone,
    sector,
    docType,
    risk,
    embeddings: {
      embeddingsId: embeddingsManifest.embeddingsId,
      model: embeddingsManifest.model,
      dimensions: embeddingsManifest.dimensions,
      index: {
        name: embeddingIndex.name,
        chunkSize: embeddingIndex.chunkSize,
        overlap: embeddingIndex.overlap
      }
    },
    classifiers: {
      manifestId: classifiersManifest.classifiersId,
      trustZoneClassifier: "trustZoneClassifier",
      sectorClassifier: "sectorClassifier",
      docTypeClassifier: "docTypeClassifier",
      riskClassifier: "riskClassifier"
    }
  };
}

// --- Public API ---

module.exports = {
  buildSemanticRoutingPlan,
  classifyTrustZone,
  classifySector,
  classifyDocType,
  classifyRisk
};
