import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

import { formatProjectionReport, validateProjection } from "./lib/projection.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const result = validateProjection(root);

if (result.errors.length > 0) {
  for (const error of result.errors) {
    console.error(`route projection: ${error}`);
  }
  process.exitCode = 1;
} else {
  console.log(formatProjectionReport(result));
}
