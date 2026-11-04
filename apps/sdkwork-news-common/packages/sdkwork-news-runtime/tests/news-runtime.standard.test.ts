import { describe, expect, it } from "vitest";
import { createTokenManager } from "@sdkwork/sdk-common";
import {
  createNewsBrowserRuntime,
  createNewsFeedRuntime,
  createSdkworkNewsRuntime,
  resolveNewsFeedBootstrap,
} from "../src/index.ts";

describe("sdkwork-news runtime", () => {
  it("binds service with sdkwork-news ownership metadata", () => {
    const runtime = createSdkworkNewsRuntime({ listPublished: async () => [], retrieveBySlug: async () => ({} as never) });
    expect(runtime.owner).toBe("sdkwork-news");
    expect(runtime.routeCount).toBe(152);
  });

  it("shares the application token manager with the News SDK client", () => {
    const tokenManager = createTokenManager();
    const runtime = createNewsFeedRuntime({
      newsApplicationPublicHttpUrl: "https://news.example.test",
      tokenManager,
    });

    expect(runtime.tokenManager).toBe(tokenManager);
    expect(runtime.client).toBeDefined();
    expect(runtime.service).toBeDefined();
  });

  it("resolves the News URL from the platform gateway and strips trailing slashes", () => {
    expect(resolveNewsFeedBootstrap({
      PROD: true,
      VITE_SDKWORK_NEWS_PLATFORM_API_GATEWAY_HTTP_URL: "https://api.example.test/",
    })).toEqual({
      config: {
        newsApplicationPublicHttpUrl: "https://api.example.test",
      },
      mode: "sdk",
    });
  });

  it("fails closed when production News SDK configuration is absent", () => {
    expect(() => resolveNewsFeedBootstrap({ PROD: true })).toThrow(
      /requires the News application public HTTP URL/u,
    );
  });

  it("rejects credentials in a public News SDK URL", () => {
    expect(() => resolveNewsFeedBootstrap({
      PROD: true,
      VITE_SDKWORK_NEWS_APPLICATION_PUBLIC_HTTP_URL: "https://user@example.test",
    })).toThrow(/must not contain credentials/u);
  });

  it("initializes every browser capability in demo mode", async () => {
    const runtime = await createNewsBrowserRuntime({
      environment: {
        VITE_SDKWORK_NEWS_DEMO_MODE: "true",
        VITE_SDKWORK_NEWS_ENVIRONMENT: "development",
      },
      platform: "H5",
      storage: createMemoryStorage(),
    });

    expect(runtime.platform).toBe("H5");
    expect(runtime.diagnostics.map((entry) => entry.mode)).toEqual([
      "demo",
      "demo",
      "demo",
      "demo",
      "demo",
    ]);
    expect(runtime.news.service).toBeUndefined();
    expect(runtime.comments.service).toBeDefined();
  });

  it("isolates production configuration failures instead of failing startup", async () => {
    const runtime = await createNewsBrowserRuntime({
      environment: {
        VITE_SDKWORK_NEWS_ENVIRONMENT: "production",
        VITE_SDKWORK_NEWS_DEMO_MODE: "false",
      },
      platform: "WEB",
      storage: createMemoryStorage(),
    });

    expect(runtime.account.mode).toBe("unavailable");
    expect(runtime.aiStore.mode).toBe("unavailable");
    expect(runtime.comments.mode).toBe("unavailable");
    expect(runtime.news.mode).toBe("unavailable");
    expect(runtime.diagnostics).toHaveLength(5);
    expect(
      runtime.diagnostics.filter((entry) => entry.mode === "unavailable"),
    ).toHaveLength(4);
  });
});

function createMemoryStorage() {
  const values = new Map<string, string>();
  return {
    getItem(key: string) {
      return values.get(key) ?? null;
    },
    removeItem(key: string) {
      values.delete(key);
    },
    setItem(key: string, value: string) {
      values.set(key, value);
    },
  };
}
