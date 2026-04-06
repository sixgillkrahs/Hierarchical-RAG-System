export type RagCapability = {
  chatModel: string;
  embeddingModel: string;
  provider: string;
  status: string;
  topK: number;
};

export type RagQueryResult = {
  answer: string;
  chatModel: string;
  contextChunks: Array<{ content: string; rank: number }>;
  embeddingModel: string;
  provider: string;
  question: string;
  retrievalPlan: string[];
  topK: number;
};

