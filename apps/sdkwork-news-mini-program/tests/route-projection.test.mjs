import assert from "node:assert/strict";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

import {
  formatProjectionReport,
  validateProjection,
} from "../scripts/lib/projection.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

test("route projection covers root and subpackage pages", () => {
  const result = validateProjection(root);
  assert.deepEqual(result.errors, []);
  assert.equal(result.routes.length, 6);
  assert.equal(result.app.tabBar.list.length, 4);
  assert.match(formatProjectionReport(result), /subpackage pages: 1/u);
});

test("every tab declares a filled and outline icon pair", () => {
  const { app } = validateProjection(root);
  for (const tab of app.tabBar.list) {
    assert.ok(tab.iconPath);
    assert.ok(tab.selectedIconPath);
    assert.notEqual(tab.iconPath, tab.selectedIconPath);
  }
});
