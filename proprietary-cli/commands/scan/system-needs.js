import fs from 'fs';
import path from 'path';

/**
 * Load audit JSON (the file you provided)
 */
export function loadAudit(auditPath) {
  const raw = fs.readFileSync(auditPath, 'utf8');
  return JSON.parse(raw);
}

/**
 * Extract missing folders, missing files, broken routes, malformed assets
 */
export function computeSystemNeeds(audit) {
  const needs = [];

  // -------------------------------
  // 1. Missing CSS placeholders
  // -------------------------------
  for (const group of audit.missingPlaceholders) {
    for (const item of group.items) {
      needs.push({
        category: group.category,
        severity: group.severity,
        path: item.path,
        status: item.status,
        referencedBy: item.referencedBy || null,
        note: item.note || null
      });
    }
  }

  // -------------------------------
  // 2. Missing image assets
  // -------------------------------
  for (const group of audit.missingPlaceholders) {
    if (group.category === 'Image Assets') {
      for (const item of group.items) {
        needs.push({
          category: 'Image Assets',
          severity: item.priority,
          path: item.path,
          referencedBy: item.referencedBy,
          status: item.status
        });
      }
    }
  }

  // -------------------------------
  // 3. Missing policy files
  // -------------------------------
  for (const group of audit.missingPlaceholders) {
    if (group.category === 'Policy Files') {
      for (const item of group.items) {
        if (item.status !== 'created') {
          needs.push({
            category: 'Policy Files',
            severity: group.severity,
            path: item.path,
            description: item.description || null,
            status: item.status
          });
        }
      }
    }
  }

  // -------------------------------
  // 4. Missing trust zone hubs
  // -------------------------------
  for (const struct of audit.structuralIssues) {
    if (struct.id === 'STRUCT-002') {
      for (const hub of struct.missingHubs) {
        needs.push({
          category: 'Trust Zone Hub',
          severity: struct.severity,
          hubName: hub,
          status: 'missing',
          referencedIn: struct.referencedIn
        });
      }
    }
  }

  // -------------------------------
  // 5. Missing contractor tools
  // -------------------------------
  for (const group of audit.missingPlaceholders) {
    if (group.id === 'MISSING-005') {
      for (const item of group.items) {
        if (item.missingFiles) {
          for (const file of item.missingFiles) {
            needs.push({
              category: 'Contractor Tools',
              severity: group.severity,
              path: path.join(item.directory, file),
              status: 'missing'
            });
          }
        }
      }
    }
  }

  // -------------------------------
  // 6. Outdated or malformed files
  // -------------------------------
  for (const out of audit.outdated) {
    needs.push({
      category: 'Outdated File',
      severity: out.severity,
      path: out.file,
      issue: out.issue,
      resolution: out.resolution
    });
  }

  for (const empty of audit.emptyFiles) {
    needs.push({
      category: 'Empty File',
      severity: empty.severity,
      path: empty.file,
      issue: empty.issue,
      action: empty.action
    });
  }

  // -------------------------------
  // 7. Structural issues
  // -------------------------------
  for (const struct of audit.structuralIssues) {
    needs.push({
      category: 'Structural Issue',
      severity: struct.severity,
      issue: struct.issue,
      affected: struct.affected || struct.missingHubs,
      recommendation: struct.recommendation
    });
  }

  // -------------------------------
  // 8. Move suggestions (broken routes)
  // -------------------------------
  for (const move of audit.moveSuggestions) {
    needs.push({
      category: 'Route Correction',
      severity: move.severity,
      currentPath: move.currentPath,
      suggestedPath: move.suggestedPath,
      reason: move.reason,
      status: move.status
    });
  }

  return needs;
}

/**
 * CLI entry point
 */
export function scanSystemNeeds(rootDir, auditPath) {
  const audit = loadAudit(auditPath);
  const needs = computeSystemNeeds(audit);

  console.log('=== Seven‑OS System Needs ===');
  console.table(needs);

  return needs;
}
