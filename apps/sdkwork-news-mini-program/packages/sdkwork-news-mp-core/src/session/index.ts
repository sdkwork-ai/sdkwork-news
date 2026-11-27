/**
 * Session and runtime configuration.
 *
 * The mini program authenticates with a build-time access token rather than an
 * interactive login, so its "session" is the resolved runtime config.
 */
export { resolveNewsMiniProgramRuntimeConfig } from "../config.js";
export type { NewsMiniProgramRuntimeEnvironment } from "../config.js";
export type {
  NewsMiniProgramDeploymentProfile,
  NewsMiniProgramEnvironment,
  NewsMiniProgramPlatform,
  NewsMiniProgramRuntimeConfig,
} from "../contracts.js";
