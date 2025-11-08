/**
 * PURPOSE: Mock AI service for testing without API costs
 * DATA FLOW: Test → MockAIService → Predefined Responses
 * INTEGRATION POINTS: All tests requiring AI functionality
 * CONTRACT VERSION: v1
 * ERROR HANDLING: Returns configurable success or failure responses
 */

import {
  AIRequest,
  AIResponse,
  AnalysisRequest,
  AnalysisResult,
  ClassificationRequest,
  ClassificationResult,
  IAIService,
  SemanticSearchRequest,
  SemanticSearchResult,
} from "../contracts/ai-service.contract";
import {
  ContractResult,
  createAgentError,
  ErrorCategory,
  failure,
  success,
} from "../contracts/types";

/**
 * Mock AI Service for Testing
 *
 * Provides configurable mock responses for all AI operations.
 * Use this in tests to avoid API calls and control responses.
 */
export class MockAIService implements IAIService {
  private responses: Map<string, any> = new Map();
  private shouldFail: Map<string, boolean> = new Map();
  private callCounts: Map<string, number> = new Map();

  /**
   * Configure mock response for a specific method
   */
  setMockResponse(method: keyof IAIService, response: any) {
    this.responses.set(method, response);
  }

  /**
   * Configure method to return failure
   */
  setMethodToFail(method: keyof IAIService, shouldFail: boolean = true) {
    this.shouldFail.set(method, shouldFail);
  }

  /**
   * Get number of times a method was called
   */
  getCallCount(method: keyof IAIService): number {
    return this.callCounts.get(method) || 0;
  }

  /**
   * Reset all mock state
   */
  reset() {
    this.responses.clear();
    this.shouldFail.clear();
    this.callCounts.clear();
  }

  private incrementCallCount(method: string) {
    this.callCounts.set(method, (this.callCounts.get(method) || 0) + 1);
  }

  async complete(request: AIRequest): Promise<ContractResult<AIResponse>> {
    this.incrementCallCount("complete");

    if (this.shouldFail.get("complete")) {
      return failure(
        createAgentError(
          "mock-ai-service",
          "Mock AI completion failed",
          ErrorCategory.OPERATION_FAILED
        )
      );
    }

    const mockResponse = this.responses.get("complete") || {
      content: "Mock AI response: This is a simulated completion",
      model: "mock-grok",
      usage: { inputTokens: 100, outputTokens: 50 },
    };

    return success(mockResponse);
  }

  async semanticSearch(
    request: SemanticSearchRequest
  ): Promise<ContractResult<SemanticSearchResult[]>> {
    this.incrementCallCount("semanticSearch");

    if (this.shouldFail.get("semanticSearch")) {
      return failure(
        createAgentError(
          "mock-ai-service",
          "Mock semantic search failed",
          ErrorCategory.OPERATION_FAILED
        )
      );
    }

    const mockResults = this.responses.get("semanticSearch") || [
      {
        id: request.documents[0]?.id || "doc-1",
        content: request.documents[0]?.content || "Mock document",
        score: 0.95,
        metadata: request.documents[0]?.metadata || {},
      },
      {
        id: request.documents[1]?.id || "doc-2",
        content: request.documents[1]?.content || "Another mock document",
        score: 0.85,
        metadata: request.documents[1]?.metadata || {},
      },
    ];

    return success(mockResults.slice(0, request.topK || 10));
  }

  async classify(
    request: ClassificationRequest
  ): Promise<ContractResult<ClassificationResult>> {
    this.incrementCallCount("classify");

    if (this.shouldFail.get("classify")) {
      return failure(
        createAgentError(
          "mock-ai-service",
          "Mock classification failed",
          ErrorCategory.OPERATION_FAILED
        )
      );
    }

    const mockResult = this.responses.get("classify") || {
      category: request.categories[0] || "default",
      confidence: 0.9,
      reasoning: "Mock classification based on test data",
    };

    return success(mockResult);
  }

  async analyze(
    request: AnalysisRequest
  ): Promise<ContractResult<AnalysisResult>> {
    this.incrementCallCount("analyze");

    if (this.shouldFail.get("analyze")) {
      return failure(
        createAgentError(
          "mock-ai-service",
          "Mock analysis failed",
          ErrorCategory.OPERATION_FAILED
        )
      );
    }

    const mockResult = this.responses.get("analyze") || {
      summary: `Mock analysis of ${request.analysisType} content`,
      insights: [
        "Mock insight 1: Code structure is well-organized",
        "Mock insight 2: Consider adding more documentation",
        "Mock insight 3: Performance optimization opportunities exist",
      ],
      recommendations: [
        "Mock recommendation 1: Add unit tests",
        "Mock recommendation 2: Implement error recovery",
        "Mock recommendation 3: Add logging",
      ],
      details: {
        analysisType: request.analysisType,
        contentLength: request.content.length,
        mockData: true,
      },
    };

    return success(mockResult);
  }
}

/**
 * Helper function to create a pre-configured MockAIService for tests
 */
export function createMockAIService(
  config?: Partial<{
    completeResponse: any;
    semanticSearchResponse: any;
    classifyResponse: any;
    analyzeResponse: any;
  }>
): MockAIService {
  const mock = new MockAIService();

  if (config?.completeResponse) {
    mock.setMockResponse("complete", config.completeResponse);
  }
  if (config?.semanticSearchResponse) {
    mock.setMockResponse("semanticSearch", config.semanticSearchResponse);
  }
  if (config?.classifyResponse) {
    mock.setMockResponse("classify", config.classifyResponse);
  }
  if (config?.analyzeResponse) {
    mock.setMockResponse("analyze", config.analyzeResponse);
  }

  return mock;
}
