import type { NewsExperiment } from './news-experiment';

export interface ExperimentsCreateResponse201 {
  code: 0;
  data: unknown & { item: NewsExperiment; };
  /** Server-owned request correlation id. */
  traceId: string;
}
