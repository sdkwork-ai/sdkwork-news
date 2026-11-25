#!/usr/bin/env node
/**
 * Refresh news entity links on a fixed interval.
 *
 * Wraps `tools/news_entity_link_import.mjs --scan-db --apply` with abort
 * handling, bounded failure backoff and structured pass logs. The importer
 * owns matching, event classification and idempotent SQL application.
 *
 * Usage:
 *   node tools/news_entity_worker.mjs --once
 *   node tools/news_entity_worker.mjs --interval-seconds 300
 */

import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { parseWorkerArgs, runWorker, usage } from "./lib/worker_loop.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const IMPORTER = path.join(ROOT, "tools", "news_entity_link_import.mjs");

function runEntityExtraction(limit) {
  return (signal) =>
    new Promise((resolve, reject) => {
      const child = spawn(
        process.execPath,
        [IMPORTER, "--scan-db", "--limit", String(limit), "--apply"],
        { cwd: ROOT, stdio: "inherit" },
      );
      const onAbort = () => child.kill("SIGTERM");
      signal.addEventListener("abort", onAbort, { once: true });
      const cleanup = () => signal.removeEventListener("abort", onAbort);
      child.on("error", (error) => {
        cleanup();
        reject(error);
      });
      child.on("close", (code, childSignal) => {
        cleanup();
        if (code === 0) {
          resolve();
          return;
        }
        reject(
          new Error(
            childSignal
              ? `news entity importer terminated by ${childSignal}`
              : `news entity importer exited with code ${code}`,
          ),
        );
      });
    });
}

async function main() {
  const options = parseWorkerArgs(process.argv.slice(2), {
    intervalSeconds: 300,
    maxBackoffSeconds: 1800,
    limit: 500,
  });
  if (options.help) {
    process.stdout.write(`${usage("tools/news_entity_worker.mjs", "Refresh news entity links.")}\n`);
    return;
  }
  const controller = new AbortController();
  const stop = () => controller.abort();
  process.once("SIGINT", stop);
  process.once("SIGTERM", stop);
  await runWorker({
    name: "news-entity-refresh",
    runOnce: runEntityExtraction(options.limit),
    signal: controller.signal,
    intervalSeconds: options.intervalSeconds,
    maxBackoffSeconds: options.maxBackoffSeconds,
    once: options.once,
  });
}

main().catch((error) => {
  process.stderr.write(`[news_entity_worker] ${error.message}\n`);
  process.exitCode = 1;
});
