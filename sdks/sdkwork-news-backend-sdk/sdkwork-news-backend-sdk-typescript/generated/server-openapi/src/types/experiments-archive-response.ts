import type { NewsExperiment } from './news-experiment';

export interface ExperimentsArchiveResponse {
  code: 0;
  data: unknown & { item: NewsExperiment; };
  /** Server-owned request correlation id. */
  traceId: string;
}
