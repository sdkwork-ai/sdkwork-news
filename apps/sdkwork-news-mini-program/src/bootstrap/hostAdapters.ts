import { createWeixinNewsMiniProgramHost } from "@sdkwork/news-mp-host";
import type { NewsMiniProgramHost } from "@sdkwork/news-mp-core";

export function createNewsMiniProgramHost(): NewsMiniProgramHost {
  return createWeixinNewsMiniProgramHost(wx);
}
