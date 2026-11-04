import { readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const requiredKeys = [
  "SDKWORK_ACCESS_TOKEN",
  "SDKWORK_APP_ID",
  "SDKWORK_DEPLOYMENT_PROFILE",
  "SDKWORK_ENVIRONMENT",
  "SDKWORK_PROFILE_ID",
  "SDKWORK_RUNTIME_TARGET",
];
const secretPatterns = [
  /-----BEGIN [A-Z ]*PRIVATE KEY-----/u,
  /APP_SECRET/u,
  /MCH_KEY/u,
  /DATABASE_URL/u,
  /REDIS_URL/u,
];

const errors = [];

for (const file of readdirSync(join(root, "config/mini-program"))) {
  if (!file.endsWith(".json")) {
    continue;
  }
  const path = join(root, "config/mini-program", file);
  const parsed = JSON.parse(readFileSync(path, "utf8"));
  for (const key of requiredKeys) {
    if (typeof parsed[key] !== "string" || !parsed[key].trim()) {
      errors.push(`${file}: missing ${key}`);
    }
  }
  if (parsed.SDKWORK_RUNTIME_TARGET !== "mini-program") {
    errors.push(`${file}: SDKWORK_RUNTIME_TARGET must be mini-program`);
  }
  if (file.includes(".production.") && /development|test/iu.test(parsed.SDKWORK_PROFILE_ID)) {
    errors.push(`${file}: production profile points at a non-production environment`);
  }
}

for (const sourceRoot of [join(root, "src/pages"), join(root, "packages")]) {
  for (const file of walk(sourceRoot)) {
    if (!/\.(?:ts|tsx|json)$/u.test(file)) {
      continue;
    }
    const content = readFileSync(file, "utf8");
    for (const pattern of secretPatterns) {
      if (pattern.test(content)) {
        errors.push(`secret-like content in ${file}`);
      }
    }
    if (
      !file.includes("sdkwork-news-mp-host") &&
      /\bwx\./u.test(content)
    ) {
      errors.push(`direct platform API outside mp-host: ${file}`);
    }
  }
}

if (errors.length > 0) {
  for (const error of errors) {
    console.error(`config verification: ${error}`);
  }
  process.exitCode = 1;
} else {
  console.log("mini-program config and host boundaries verified");
}

function* walk(path) {
  for (const entry of readdirSync(path)) {
    const next = join(path, entry);
    const stat = statSync(next);
    if (stat.isDirectory()) {
      yield* walk(next);
    } else {
      yield next;
    }
  }
}
