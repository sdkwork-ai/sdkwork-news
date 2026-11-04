import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const ROUTE_ID = /^app\.[a-z0-9-]+\.[a-z0-9-]+\.[a-z0-9-]+$/u;

export function readJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

export function validateProjection(root) {
  const routes = readJson(
    join(root, "packages/sdkwork-news-mp-news/src/routes/routes.json"),
  );
  const app = readJson(join(root, "src/app.json"));
  const rootPages = new Set(app.pages ?? []);
  const subpackages = new Map(
    (app.subpackages ?? []).map((entry) => [entry.root, new Set(entry.pages)]),
  );
  const errors = [];

  if (!Array.isArray(routes) || routes.length === 0) {
    errors.push("route manifest is empty");
  }

  for (const route of routes) {
    if (!ROUTE_ID.test(route.id)) {
      errors.push(`invalid route id: ${route.id}`);
    }
    const placement = route.miniProgram;
    if (!placement?.pagePath) {
      errors.push(`route ${route.id} has no pagePath`);
      continue;
    }
    if (placement.rootPackage) {
      if (!rootPages.has(placement.pagePath)) {
        errors.push(`root page missing from app.json: ${placement.pagePath}`);
      }
    } else if (placement.subpackage) {
      const pages = subpackages.get(`subpackages/${placement.subpackage}`);
      if (!pages?.has(placement.pagePath)) {
        errors.push(
          `subpackage page missing from app.json: ${placement.subpackage}/${placement.pagePath}`,
        );
      }
    }
    const pageRoot = placement.rootPackage
      ? join(root, "src", placement.pagePath)
      : join(root, "src/subpackages", placement.subpackage, placement.pagePath);
    for (const extension of [".ts", ".wxml", ".wxss", ".json"]) {
      if (!existsSync(`${pageRoot}${extension}`)) {
        errors.push(`projected page file missing: ${pageRoot}${extension}`);
      }
    }
  }

  for (const tab of app.tabBar?.list ?? []) {
    if (!rootPages.has(tab.pagePath)) {
      errors.push(`tab page is not a root page: ${tab.pagePath}`);
    }
    for (const icon of [tab.iconPath, tab.selectedIconPath]) {
      if (!icon || !existsSync(join(root, "src", icon))) {
        errors.push(`tab icon missing: ${icon}`);
      }
    }
  }

  return { app, errors, routes };
}

export function formatProjectionReport(result) {
  const rootPages = result.routes.filter(
    (route) => route.miniProgram?.rootPackage,
  ).length;
  const subpackagePages = result.routes.length - rootPages;
  return [
    `routes: ${result.routes.length}`,
    `root pages: ${rootPages}`,
    `subpackage pages: ${subpackagePages}`,
    `tabs: ${result.app.tabBar?.list?.length ?? 0}`,
  ].join("\n");
}
