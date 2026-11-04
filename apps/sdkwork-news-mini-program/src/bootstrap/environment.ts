import type {
  NewsMiniProgramRuntimeConfig,
} from "@sdkwork/news-mp-core";

export const ACTIVE_MINI_PROGRAM_PROFILE = {
  SDKWORK_ACCESS_TOKEN: "mini-program-development-public-token",
  SDKWORK_APP_ID: "sdkwork-news",
  SDKWORK_DEPLOYMENT_PROFILE: "standalone",
  SDKWORK_ENVIRONMENT: "development",
  SDKWORK_PROFILE_ID: "standalone.development",
  SDKWORK_RUNTIME_TARGET: "mini-program",
} as const;

export type MiniProgramRuntimeEnvironment = Readonly<Record<string, unknown>>;

export function createMiniProgramRuntimeEnvironment(
  overrides: MiniProgramRuntimeEnvironment = {},
): MiniProgramRuntimeEnvironment {
  return { ...ACTIVE_MINI_PROGRAM_PROFILE, ...overrides };
}

export type { NewsMiniProgramRuntimeConfig };
