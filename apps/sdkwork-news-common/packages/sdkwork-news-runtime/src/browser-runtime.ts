import { createClient as createCommentsClient } from "@sdkwork/comments-app-sdk";
import { resolveNewsAccountBootstrap } from "@sdkwork/news-account-runtime/config";
import type { NewsAccountService } from "@sdkwork/news-account-service";
import { resolveNewsAgentBootstrap } from "@sdkwork/news-agent-bootstrap/config";
import type { NewsAgentService } from "@sdkwork/news-agent-service";
import { resolveAiStoreBootstrap } from "@sdkwork/news-ai-store-runtime/config";
import type { AiStoreService } from "@sdkwork/news-ai-store-service";
import { createSdkworkNewsCommentsService } from "@sdkwork/news-comments-sdk-adapter";
import {
  createDemoNewsCommentsService,
  type NewsCommentsService,
} from "@sdkwork/news-comments-service";
import type { NewsFeedService } from "@sdkwork/news-feed-service";
import { createTokenManager, type AuthTokenManager } from "@sdkwork/sdk-common";

import {
  resolveCommentsBootstrap,
  resolveNewsFeedBootstrap,
  type NewsRuntimeEnvironment,
} from "./config.js";
import { createNewsFeedRuntime } from "./feed-runtime.js";

/** Browser surfaces that share the SDKWork News runtime composition. */
export type NewsBrowserPlatform = "H5" | "WEB";

/** Minimum storage contract shared by browser and embedded web views. */
export interface NewsBrowserStorage {
  getItem(key: string): string | null;
  removeItem(key: string): void;
  setItem(key: string, value: string): void;
}

export type NewsBrowserCapabilityName =
  | "account"
  | "agent"
  | "aiStore"
  | "comments"
  | "news";

export type NewsBrowserCapabilityMode = "demo" | "sdk" | "unavailable";

/**
 * One capability's startup result. A failed capability never prevents the
 * remaining capabilities from initialising, so the shell can still render a
 * useful news experience when, for example, the AI Store is not configured.
 */
export interface NewsBrowserCapability<TService> {
  error?: string;
  mode: NewsBrowserCapabilityMode;
  service?: TService;
}

export interface NewsBrowserBootstrapDiagnostic {
  capability: NewsBrowserCapabilityName;
  message?: string;
  mode: NewsBrowserCapabilityMode;
}

export interface NewsBrowserRuntime {
  account: NewsBrowserCapability<NewsAccountService>;
  agent: NewsBrowserCapability<NewsAgentService>;
  aiStore: NewsBrowserCapability<AiStoreService>;
  comments: NewsBrowserCapability<NewsCommentsService>;
  diagnostics: readonly NewsBrowserBootstrapDiagnostic[];
  news: NewsBrowserCapability<NewsFeedService>;
  platform: NewsBrowserPlatform;
  tokenManager: AuthTokenManager;
}

export interface CreateNewsBrowserRuntimeInput {
  environment: NewsRuntimeEnvironment;
  platform: NewsBrowserPlatform;
  storage: NewsBrowserStorage;
  timeoutMs?: number;
  tokenManager?: AuthTokenManager;
}

const DEFAULT_CAPABILITY_TIMEOUT_MS = 8_000;

/**
 * Builds the complete News browser runtime once, in parallel across
 * capabilities, and isolates every failure to its owning capability.
 */
export async function createNewsBrowserRuntime(
  input: CreateNewsBrowserRuntimeInput,
): Promise<NewsBrowserRuntime> {
  const tokenManager = input.tokenManager ?? createTokenManager();
  const timeoutMs = input.timeoutMs ?? DEFAULT_CAPABILITY_TIMEOUT_MS;

  const [account, agent, aiStore, comments, news] = await Promise.all([
    bootstrapAccount(input.environment, input.storage, tokenManager, timeoutMs),
    bootstrapAgent(input.environment, tokenManager),
    bootstrapAiStore(input.environment, tokenManager, input.platform),
    bootstrapComments(input.environment, tokenManager),
    bootstrapNews(input.environment, tokenManager),
  ]);

  return {
    account,
    agent,
    aiStore,
    comments,
    diagnostics: [
      diagnostic("account", account),
      diagnostic("agent", agent),
      diagnostic("aiStore", aiStore),
      diagnostic("comments", comments),
      diagnostic("news", news),
    ],
    news,
    platform: input.platform,
    tokenManager,
  };
}

async function bootstrapAccount(
  environment: NewsRuntimeEnvironment,
  storage: NewsBrowserStorage,
  tokenManager: AuthTokenManager,
  timeoutMs: number,
): Promise<NewsBrowserCapability<NewsAccountService>> {
  try {
    const resolution = resolveNewsAccountBootstrap(environment);
    if (resolution.mode === "demo") {
      return { mode: "demo" };
    }
    if (!resolution.config) {
      return unavailable("Account bootstrap produced no configuration.");
    }
    const { createNewsAccountRuntime } = await import(
      "@sdkwork/news-account-runtime/runtime"
    );
    const runtime = createNewsAccountRuntime({
      ...resolution.config,
      storage,
      tokenManager,
    });
    try {
      await withTimeout(
        runtime.hydrate(),
        timeoutMs,
        "Account session hydration timed out.",
      );
      return { mode: "sdk", service: runtime.service };
    } catch (error) {
      return {
        error: describeError(error),
        mode: "sdk",
        service: runtime.service,
      };
    }
  } catch (error) {
    return unavailable(describeError(error));
  }
}

async function bootstrapAgent(
  environment: NewsRuntimeEnvironment,
  tokenManager: AuthTokenManager,
): Promise<NewsBrowserCapability<NewsAgentService>> {
  try {
    const resolution = resolveNewsAgentBootstrap(environment);
    if (resolution.mode === "demo") {
      return { mode: "demo" };
    }
    if (!resolution.config) {
      return unavailable("Agent bootstrap produced no configuration.");
    }
    const { createNewsAgentRuntime } = await import(
      "@sdkwork/news-agent-bootstrap/runtime"
    );
    return {
      mode: "sdk",
      service: createNewsAgentRuntime({
        ...resolution.config,
        tokenManager,
      }).service,
    };
  } catch (error) {
    return unavailable(describeError(error));
  }
}

async function bootstrapAiStore(
  environment: NewsRuntimeEnvironment,
  tokenManager: AuthTokenManager,
  platform: NewsBrowserPlatform,
): Promise<NewsBrowserCapability<AiStoreService>> {
  try {
    const resolution = resolveAiStoreBootstrap(environment);
    if (resolution.mode === "demo") {
      return { mode: "demo" };
    }
    if (!resolution.config) {
      return unavailable("AI Store bootstrap produced no configuration.");
    }
    const { createAiStoreRuntime } = await import(
      "@sdkwork/news-ai-store-runtime/runtime"
    );
    return {
      mode: "sdk",
      service: createAiStoreRuntime({
        ...resolution.config,
        platform,
        tokenManager,
      }).service,
    };
  } catch (error) {
    return unavailable(describeError(error));
  }
}

async function bootstrapComments(
  environment: NewsRuntimeEnvironment,
  tokenManager: AuthTokenManager,
): Promise<NewsBrowserCapability<NewsCommentsService>> {
  try {
    const resolution = resolveCommentsBootstrap(environment);
    if (resolution.mode === "demo") {
      return {
        mode: "demo",
        service: createDemoNewsCommentsService(),
      };
    }
    if (!resolution.config) {
      return unavailable("Comments bootstrap produced no configuration.");
    }
    const client = createCommentsClient({
      baseUrl: resolution.config.commentsApplicationPublicHttpUrl,
      tokenManager,
    });
    return {
      mode: "sdk",
      service: createSdkworkNewsCommentsService(client),
    };
  } catch (error) {
    return unavailable(describeError(error));
  }
}

async function bootstrapNews(
  environment: NewsRuntimeEnvironment,
  tokenManager: AuthTokenManager,
): Promise<NewsBrowserCapability<NewsFeedService>> {
  try {
    const resolution = resolveNewsFeedBootstrap(environment);
    if (resolution.mode === "demo") {
      return { mode: "demo" };
    }
    if (!resolution.config) {
      return unavailable("News feed bootstrap produced no configuration.");
    }
    return {
      mode: "sdk",
      service: createNewsFeedRuntime({
        ...resolution.config,
        tokenManager,
      }).service,
    };
  } catch (error) {
    return unavailable(describeError(error));
  }
}

function diagnostic(
  capability: NewsBrowserCapabilityName,
  value: NewsBrowserCapability<unknown>,
): NewsBrowserBootstrapDiagnostic {
  return {
    capability,
    ...(value.error ? { message: value.error } : {}),
    mode: value.mode,
  };
}

function unavailable(message: string): NewsBrowserCapability<never> {
  return { error: message, mode: "unavailable" };
}

function describeError(error: unknown): string {
  return error instanceof Error && error.message
    ? error.message
    : "Capability initialization failed.";
}

async function withTimeout<T>(
  value: Promise<T>,
  timeoutMs: number,
  message: string,
): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      value,
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => reject(new Error(message)), timeoutMs);
      }),
    ]);
  } finally {
    if (timer) {
      clearTimeout(timer);
    }
  }
}
