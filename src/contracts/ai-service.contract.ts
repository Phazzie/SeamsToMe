/**
 * PURPOSE: Define the AI service interface for LLM interactions
 * DATA FLOW: Agents → AI Service → LLM API
 * INTEGRATION POINTS: All agents that need AI capabilities
 * CONTRACT VERSION: v1
 * ERROR HANDLING: Returns ContractResult with detailed error information
 */

import { ContractResult } from "./types";

export interface AIMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface AIRequest {
  messages: AIMessage[];
  maxTokens?: number;
  temperature?: number;
  systemPrompt?: string;
}

export interface AIResponse {
  content: string;
  model: string;
  usage?: {
    inputTokens: number;
    outputTokens: number;
  };
}

export interface SemanticSearchRequest {
  query: string;
  documents: Array<{ id: string; content: string; metadata?: any }>;
  topK?: number;
}

export interface SemanticSearchResult {
  id: string;
  content: string;
  score: number;
  metadata?: any;
}

export interface ClassificationRequest {
  text: string;
  categories: string[];
  instructions?: string;
}

export interface ClassificationResult {
  category: string;
  confidence: number;
  reasoning?: string;
}

export interface AnalysisRequest {
  content: string;
  analysisType: "code" | "text" | "design" | "requirements";
  instructions: string;
  context?: any;
}

export interface AnalysisResult {
  summary: string;
  insights: string[];
  recommendations: string[];
  details: any;
}

/**
 * AI Service Contract
 * Provides AI/LLM capabilities to all agents
 */
export interface IAIService {
  /**
   * Send a prompt to the AI and get a response
   * @param request The AI request with messages and parameters
   * @returns A promise that resolves to the AI response
   */
  complete(request: AIRequest): Promise<ContractResult<AIResponse>>;

  /**
   * Perform semantic search across documents
   * @param request The search request with query and documents
   * @returns A promise that resolves to ranked search results
   */
  semanticSearch(
    request: SemanticSearchRequest
  ): Promise<ContractResult<SemanticSearchResult[]>>;

  /**
   * Classify text into one of the provided categories
   * @param request The classification request
   * @returns A promise that resolves to the classification result
   */
  classify(
    request: ClassificationRequest
  ): Promise<ContractResult<ClassificationResult>>;

  /**
   * Analyze content and provide insights
   * @param request The analysis request
   * @returns A promise that resolves to the analysis result
   */
  analyze(request: AnalysisRequest): Promise<ContractResult<AnalysisResult>>;
}
