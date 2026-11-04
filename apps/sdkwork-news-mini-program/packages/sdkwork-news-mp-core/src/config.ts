import type {
  NewsMiniProgramDeploymentProfile,
  NewsMiniProgramEnvironment,
  NewsMiniProgramRuntimeConfig,
} from "./contracts.js";

export type NewsMiniProgramRuntimeEnvironment = Readonly<
  Record<string, unknown>
>;

export function resolveNewsMiniProgramRuntimeConfig(
  environment: NewsMiniProgramRuntimeEnvironment,
): NewsMiniProgramRuntimeConfig {
  const lifecycle = readRequired(
    environment,
    "SDKWORK_ENVIRONMENT",
    ["development", "test", "staging", "production"],
  ) as NewsMiniProgramEnvironment;
  const deploymentProfile = readRequired(
    environment,
    "SDKWORK_DEPLOYMENT_PROFILE",
    ["standalone", "cloud"],
  ) as NewsMiniProgramDeploymentProfile;
  const accessToken = readRequired(environment, "SDKWORK_ACCESS_TOKEN", undefined);
  const profileId = readRequired(environment, "SDKWORK_PROFILE_ID", undefined);
  const appId = readString(environment.SDKWORK_APP_ID) ?? "sdkwork-news";

  if (accessToken.length < 16) {
    throw new Error("SDKWORK_ACCESS_TOKEN is too short for a mini-program build.");
  }

  return {
    accessToken,
    appId,
    deploymentProfile,
    environment: lifecycle,
    platform: "mp-weixin",
    profileId,
    runtimeTarget: "mini-program",
  };
}

function readRequired(
  environment: NewsMiniProgramRuntimeEnvironment,
  key: string,
  allowed: readonly string[] | undefined,
): string {
  const value = readString(environment[key]);
  if (!value) {
    throw new Error(`${key} is required by the mini-program runtime.`);
  }
  if (allowed && !allowed.includes(value)) {
    throw new Error(`${key} must be one of ${allowed.join(", ")}.`);
  }
  return value;
}

function readString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}
