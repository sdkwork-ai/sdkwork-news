import type { NewsMiniProgramService } from "@sdkwork/news-mp-core";
import { createDemoNewsMiniProgramService } from "@sdkwork/news-mp-news";

/**
 * SDK client composition point. The demo service keeps the first-run and
 * offline experience deterministic; a generated News app SDK adapter can be
 * returned here without changing a page or feature package.
 */
export function createNewsMiniProgramService(): NewsMiniProgramService {
  return createDemoNewsMiniProgramService();
}
