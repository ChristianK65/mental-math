export type PersistAttemptInput = {
  runId: string;
  patternId: string;
  seed: number;
  firstSubmittedAnswer: string | null;
  firstResponseMs: number;
  skipped: boolean;
};
