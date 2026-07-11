const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const { traceEvent } = require('../core/tracing.js');

test('traceEvent writes a structured JSONL record', () => {
  const tempFile = path.join(os.tmpdir(), `proprietary-cli-trace-${Date.now()}.jsonl`);
  process.env.PROPRIETARY_CLI_TRACE_FILE = tempFile;

  traceEvent('test.event', { value: 42, ok: true });

  const content = fs.readFileSync(tempFile, 'utf8');
  const lines = content.trim().split('\n');
  const parsed = JSON.parse(lines[lines.length - 1]);

  assert.equal(parsed.event, 'test.event');
  assert.equal(parsed.payload.value, 42);
  assert.equal(parsed.payload.ok, true);
  assert.ok(parsed.timestamp);
});
