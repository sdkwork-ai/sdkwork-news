/**
 * Small dependency-free scheduling loop shared by news refresh daemons.
 *
 * The loop runs immediately, then waits `intervalSeconds`. Failures back off
 * exponentially (capped) and reset after a success. `--once` runs one pass and
 * propagates failure to the CLI instead of retrying forever.
 */

export function parseWorkerArgs(argv, defaults = {}) {
  const options = {
    once: false,
    intervalSeconds: defaults.intervalSeconds ?? 60,
    maxBackoffSeconds: defaults.maxBackoffSeconds ?? 600,
    limit: defaults.limit ?? 500,
  };
  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (token === "--once") {
      options.once = true;
    } else if (token === "--interval-seconds") {
      options.intervalSeconds = positiveInteger(argv[++index], token);
    } else if (token === "--max-backoff-seconds") {
      options.maxBackoffSeconds = positiveInteger(argv[++index], token);
    } else if (token === "--limit") {
      options.limit = positiveInteger(argv[++index], token);
    } else if (token === "--help" || token === "-h") {
      options.help = true;
    } else {
      throw new Error(`unknown worker argument: ${token}`);
    }
  }
  return options;
}

function positiveInteger(value, flag) {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error(`${flag} requires a positive integer`);
  }
  return parsed;
}

export function usage(scriptName, description) {
  return [
    description,
    "",
    `Usage: node ${scriptName} [--once] [--interval-seconds N] [--max-backoff-seconds N] [--limit N]`,
  ].join("\n");
}

/**
 * @param {object} input
 * @param {string} input.name
 * @param {(signal: AbortSignal) => Promise<void>} input.runOnce
 * @param {AbortSignal} input.signal
 * @param {number} [input.intervalSeconds]
 * @param {number} [input.maxBackoffSeconds]
 * @param {boolean} [input.once]
 * @param {number} [input.maxRuns] test-only upper bound
 * @param {(ms:number, signal?:AbortSignal) => Promise<void>} [input.sleep]
 * @param {(event:object) => void} [input.log]
 */
export async function runWorker(input) {
  const {
    name,
    runOnce,
    signal,
    intervalSeconds = 60,
    maxBackoffSeconds = 600,
    once = false,
    maxRuns = Number.POSITIVE_INFINITY,
    sleep = defaultSleep,
    log = (event) => process.stdout.write(`${JSON.stringify(event)}\n`),
  } = input;
  let failures = 0;
  let runs = 0;
  while (!signal.aborted && runs < maxRuns) {
    runs += 1;
    const startedAt = new Date().toISOString();
    try {
      await runOnce(signal);
      failures = 0;
      log({ worker: name, status: "ok", runs, at: startedAt });
    } catch (error) {
      failures += 1;
      if (once) {
        throw error;
      }
      log({
        worker: name,
        status: "error",
        runs,
        failures,
        message: error instanceof Error ? error.message : String(error),
        at: startedAt,
      });
    }
    if (once || signal.aborted || runs >= maxRuns) {
      break;
    }
    const delaySeconds =
      failures === 0
        ? intervalSeconds
        : Math.min(intervalSeconds * 2 ** Math.min(failures, 6), maxBackoffSeconds);
    log({ worker: name, status: "sleep", seconds: delaySeconds, at: new Date().toISOString() });
    await sleep(delaySeconds * 1000, signal);
  }
  return { runs, failures };
}

function defaultSleep(milliseconds, signal) {
  return new Promise((resolve) => {
    const timer = setTimeout(resolve, milliseconds);
    if (!signal) {
      return;
    }
    const onAbort = () => {
      clearTimeout(timer);
      resolve();
    };
    if (signal.aborted) {
      onAbort();
      return;
    }
    signal.addEventListener("abort", onAbort, { once: true });
  });
}

