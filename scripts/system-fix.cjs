import fs from 'fs';
import path from 'path';
import { loadAudit, computeSystemNeeds } from './system-needs.js';

/**
 * Ensure directory exists
 */
function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    return true;
  }
  return false;
}

/**
 * Ensure file exists (empty placeholder)
 */
function ensureFile(filePath) {
  if (!fs.existsSync(filePath)) {
    ensureDir(path.dirname(filePath));
    fs.writeFileSync(filePath, '');
    return true;
  }
  return false;
}

/**
 * Delete malformed or empty files
 */
function deleteFile(filePath) {
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    return true;
  }
  return false;
}

/**
 * Rename incorrect file paths
 */
function renameFile(oldPath, newPath) {
  if (fs.existsSync(oldPath)) {
    ensureDir(path.dirname(newPath));
    fs.renameSync(oldPath, newPath);
    return true;
  }
  return false;
}

/**
 * Apply fixes based on audit needs
 */
export function applyFixes(rootDir, auditPath) {
  const audit = loadAudit(auditPath);
  const needs = computeSystemNeeds(audit);

  const actions = [];

  for (const need of needs) {
    // -------------------------------
    // 1. Missing files
    // -------------------------------
    if (need.status === 'missing' && need.path) {
      const fullPath = path.join(rootDir, need.path);
      const created = ensureFile(fullPath);
      actions.push({
        type: 'create-file',
        path: need.path,
        result: created ? 'created' : 'already-exists'
      });
    }

    // -------------------------------
    // 2. Missing directories
    // -------------------------------
    if (need.directory) {
      const fullDir = path.join(rootDir, need.directory);
      const created = ensureDir(fullDir);
      actions.push({
        type: 'create-directory',
        path: need.directory,
        result: created ? 'created' : 'already-exists'
      });
    }

    // -------------------------------
    // 3. Outdated or malformed files
    // -------------------------------
    if (need.category === 'Outdated File') {
      const fullPath = path.join(rootDir, need.path);
      if (need.resolution?.includes('Delete')) {
        const deleted = deleteFile(fullPath);
        actions.push({
          type: 'delete-file',
          path: need.path,
          result: deleted ? 'deleted' : 'not-found'
        });
      }
    }

    if (need.category === 'Empty File') {
      const fullPath = path.join(rootDir, need.path);
      const deleted = deleteFile(fullPath);
      actions.push({
        type: 'delete-empty-file',
        path: need.path,
        result: deleted ? 'deleted' : 'not-found'
      });
    }

    // -------------------------------
    // 4. Route corrections (move files)
    // -------------------------------
    if (need.category === 'Route Correction') {
      const oldPath = path.join(rootDir, need.currentPath);
      const newPath = path.join(rootDir, need.suggestedPath);

      const moved = renameFile(oldPath, newPath);
      actions.push({
        type: 'move-file',
        from: need.currentPath,
        to: need.suggestedPath,
        result: moved ? 'moved' : 'source-not-found'
      });
    }
  }

  console.log('=== Seven‑OS Auto‑Fix Report ===');
  console.table(actions);

  return actions;
}

/**
 * CLI entry point
 */
if (process.argv[1].includes('system-fix.js')) {
  const rootDir = process.argv[2];
  const auditPath = process.argv[3];

  if (!rootDir || !auditPath) {
    console.error('Usage: node system-fix.js <rootDir> <audit.json>');
    process.exit(1);
  }

  applyFixes(rootDir, auditPath);
}
