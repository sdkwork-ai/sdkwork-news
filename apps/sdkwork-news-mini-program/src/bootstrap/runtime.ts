import type { NewsMiniProgramRuntimeConfig, NewsMiniProgramService } from "@sdkwork/news-mp-core";
import { resolveNewsMiniProgramRuntimeConfig } from "@sdkwork/news-mp-core";
import {
  createDemoNewsCommentsService,
  type NewsCommentsService,
} from "@sdkwork/news-comments-service";

import {
  createMiniProgramRuntimeEnvironment,
  type MiniProgramRuntimeEnvironment,
} from "./environment.js";
import { createNewsMiniProgramHost } from "./hostAdapters.js";
import { createNewsMiniProgramService } from "./sdkClients.js";

export interface NewsMiniProgramRuntime {
  readonly comments: NewsCommentsService;
  readonly config: NewsMiniProgramRuntimeConfig;
  readonly host: ReturnType<typeof createNewsMiniProgramHost>;
  readonly service: NewsMiniProgramService;
}

export function createNewsMiniProgramRuntime(
  overrides: MiniProgramRuntimeEnvironment = {},
): NewsMiniProgramRuntime {
  const config = resolveNewsMiniProgramRuntimeConfig(
    createMiniProgramRuntimeEnvironment(overrides),
  );
  return {
    comments: createDemoNewsCommentsService(),
    config,
    host: createNewsMiniProgramHost(),
    service: createNewsMiniProgramService(),
  };
}

export function getNewsMiniProgramRuntime(): NewsMiniProgramRuntime {
  return getApp<{ globalData: { runtime: NewsMiniProgramRuntime } }>().globalData
    .runtime;
}
