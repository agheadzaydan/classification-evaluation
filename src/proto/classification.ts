// src/proto/classification.ts

export interface EvaluationRequest {
    messageHistory: string;
    agentOutput: string;
    humanLabeledOutput: string;
    categories: string;
  }
  
  export interface EvaluationResponse {
    message: string;
    agentClassification: string;
    humanClassification: string;
    score: number;
    reason: string;
  }
  
  export interface ClassificationService {
    evaluateClassification(request: EvaluationRequest): Promise<EvaluationResponse>;
  }