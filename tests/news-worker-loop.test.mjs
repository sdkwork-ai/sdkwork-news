import assert from "node:assert/strict";
import test from "node:test";

import { parseWorkerArgs, runWorker } from "../tools/lib/worker_loop.mjs";

test("worker args default to the fixed interval and parse overrides", () => {
  const defaults = parseWorkerArgs([], { intervalSeconds: 60, maxBackoffSeconds: 600 });
  assert.equal(defaults.once, false);
  assert.equal(defaults.intervalSeconds, 60);
  assert.equal(defaults.maxBackoffSeconds, 600);
  const parsed = parseWorkerArgs(
    ["--once", "--interval-seconds", "30", "--max-backoff-seconds", "120", "--limit", "10"],
    { intervalSeconds: 60 },
  );
  assert.equal(parsed.once, true);
  assert.equal(parsed.intervalSeconds, 30);
  assert.equal(parsed.maxBackoffSeconds, 120);
  assert.equal(parsed.limit, 10);
  assert.throws(() => parseWorkerArgs(["--interval-seconds", "0"]), /positive integer/);
  assert.throws(() => parseWorkerArgs(["--unknown"]), /unknown worker argument/);
});

test("worker loop backs off after failures and resets after success", async () => {
  const sleeps = [];
  const logs = [];
  let attempts = 0;
  const result = await runWorker({
    name: "test-worker",
    signal: new AbortController().signal,
    intervalSeconds: 10,
    maxRuns: 3,
    sleep: async (milliseconds) => {
      sleeps.push(milliseconds);
    },
    log: (event) => logs.push(event),
    runOnce: async () => {
      attempts += 1;
      if (attempts < 3) {
        throw new Error(`boom-${attempts}`);
      }
    },
  });
  assert.equal(result.runs, 3);
  assert.equal(result.failures, 0);
  assert.deepEqual(sleeps, [20_000, 40_000]);
  assert.equal(logs.filter((event) => event.status === "error").length, 2);
  assert.equal(logs.filter((event) => event.status === "ok").length, 1);
});

test("--once propagates a failure instead of retrying", async () => {
  await assert.rejects(
    runWorker({
      name: "test-worker",
      signal: new AbortController().signal,
      once: true,
      runOnce: async () => {
        throw new Error("fatal");
      },
    }),
    /fatal/,
  );
});
