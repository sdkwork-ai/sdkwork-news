#!/usr/bin/env node
/**
 * Capture a browser surface with DevTools device emulation.
 *
 * Usage:
 *   node tools/capture-ui.mjs --url http://127.0.0.1:3100/ \
 *     --out docs/quality/screenshots/h5/home.png --width 430 --height 900
 */
import { spawn } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

const args = parseArgs(process.argv.slice(2));
const url = args.url;
const out = args.out;
if (!url || !out) {
  throw new Error("--url and --out are required");
}
const width = Number(args.width ?? 430);
const height = Number(args.height ?? 900);
const chromePath = args.chrome
  ?? "C:/Program Files/Google/Chrome/Application/chrome.exe";
const port = Number(args.port ?? 9333);
const profile = resolve(args.profile ?? ".cache/capture-ui-profile");

mkdirSync(dirname(resolve(out)), { recursive: true });
const chrome = spawn(chromePath, [
  "--headless=new",
  "--disable-gpu",
  "--hide-scrollbars",
  "--no-sandbox",
  "--enable-unsafe-swiftshader",
  "--use-gl=angle",
  "--use-angle=swiftshader",
  `--remote-debugging-port=${port}`,
  `--user-data-dir=${profile}`,
  "about:blank",
], { stdio: "ignore", windowsHide: true });

try {
  const version = await pollJson(`http://127.0.0.1:${port}/json/version`);
  const target = await fetch(
    `http://127.0.0.1:${port}/json/new?${encodeURIComponent("about:blank")}`,
    { method: "PUT" },
  ).then((response) => response.json());
  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((resolveOpen, rejectOpen) => {
    ws.addEventListener("open", resolveOpen, { once: true });
    ws.addEventListener("error", rejectOpen, { once: true });
  });

  let nextId = 1;
  const pending = new Map();
  ws.addEventListener("message", (event) => {
    const message = JSON.parse(String(event.data));
    if (message.method === "Runtime.exceptionThrown") {
      console.error("page exception:", message.params?.exceptionDetails?.text);
    }
    if (message.method === "Runtime.consoleAPICalled" && message.params?.type === "error") {
      console.error(
        "console error:",
        (message.params.args ?? [])
          .map((arg) => arg.value ?? arg.description ?? "")
          .join(" "),
      );
    }
    if (message.id && pending.has(message.id)) {
      const { resolve: resolveCall, reject } = pending.get(message.id);
      pending.delete(message.id);
      if (message.error) {
        reject(new Error(message.error.message));
      } else {
        resolveCall(message.result);
      }
    }
  });

  const call = (method, params = {}) => new Promise((resolveCall, reject) => {
    const id = nextId++;
    pending.set(id, { resolve: resolveCall, reject });
    ws.send(JSON.stringify({ id, method, params }));
  });

  await call("Page.enable");
  await call("Runtime.enable");
  await call("Emulation.setDeviceMetricsOverride", {
    width,
    height,
    deviceScaleFactor: 1,
    mobile: true,
  });
  await call("Page.navigate", { url });
  await new Promise((resolveWait) => setTimeout(resolveWait, Number(args.wait ?? 5000)));

  if (args.click) {
    await call("Runtime.evaluate", {
      expression: `(() => {
        const node = document.querySelector(${JSON.stringify(args.click)});
        if (!node) throw new Error("click target not found");
        node.click();
        return true;
      })()`,
      awaitPromise: true,
      returnByValue: true,
    });
    await new Promise((resolveWait) => setTimeout(resolveWait, 1200));
  }

  const scrollToSelector = args["scroll-to-selector"] ?? args.scrollToSelector;
  if (scrollToSelector) {
    await call("Runtime.evaluate", {
      expression: `(() => {
        const node = document.querySelector(${JSON.stringify(scrollToSelector)});
        if (!node) throw new Error("scroll-to target not found");
        node.scrollIntoView({ block: "start" });
        return true;
      })()`,
      awaitPromise: true,
      returnByValue: true,
    });
    await new Promise((resolveWait) => setTimeout(resolveWait, 900));
  }

  const scrollSelector = args.scrollSelector ?? args["scroll-selector"];
  if (scrollSelector) {
    await call("Runtime.evaluate", {
      expression: `(() => {
        const node = document.querySelector(${JSON.stringify(scrollSelector)});
        if (!node) throw new Error("scroll target not found");
        node.scrollTop = node.scrollHeight;
        return true;
      })()`,
      awaitPromise: true,
      returnByValue: true,
    });
    await new Promise((resolveWait) => setTimeout(resolveWait, 900));
  }

  const metrics = await call("Runtime.evaluate", {
    expression: `JSON.stringify({
      innerWidth: window.innerWidth,
      scrollWidth: document.documentElement.scrollWidth,
      bodyWidth: document.body.getBoundingClientRect().width,
      rootWidth: document.getElementById('root')?.getBoundingClientRect().width ?? null,
      nav: document.querySelector('.news-h5-shell > nav')?.getBoundingClientRect() ?? null,
      text: document.body.innerText.slice(0, 200)
    })`,
    returnByValue: true,
  });
  console.log(metrics.result.value);

  const screenshot = await call("Page.captureScreenshot", {
    format: "png",
    fromSurface: true,
    captureBeyondViewport: false,
  });
  writeFileSync(resolve(out), Buffer.from(screenshot.data, "base64"));
  console.log(`captured ${resolve(out)}`);
  ws.close();
} finally {
  chrome.kill();
}

async function pollJson(targetUrl) {
  let lastError;
  for (let attempt = 0; attempt < 80; attempt += 1) {
    try {
      const response = await fetch(targetUrl);
      if (response.ok) {
        return response.json();
      }
    } catch (error) {
      lastError = error;
    }
    await new Promise((resolveWait) => setTimeout(resolveWait, 150));
  }
  throw lastError ?? new Error("Chrome DevTools endpoint did not start");
}

function parseArgs(values) {
  const parsed = {};
  for (let index = 0; index < values.length; index += 1) {
    const key = values[index];
    if (!key?.startsWith("--")) {
      continue;
    }
    parsed[key.slice(2)] = values[index + 1];
    index += 1;
  }
  return parsed;
}
