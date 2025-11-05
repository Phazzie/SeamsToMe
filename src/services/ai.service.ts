/**
 * PURPOSE: Implement AI service using Anthropic Claude
 * DATA FLOW: Agents → AI Service → Anthropic API
 * INTEGRATION POINTS: All agents via IAIService contract
 * CONTRACT VERSION: v1
 * ERROR HANDLING: Comprehensive error handling with ContractResult
 */

import Anthropic from "@anthropic-ai/sdk";
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

export class AIService implements IAIService {
  private client: Anthropic;
  private readonly agentId = "ai-service";
  private readonly defaultModel = "claude-3-5-sonnet-20241022";
  private readonly defaultMaxTokens = 4096;

  constructor(apiKey?: string) {
    const key = apiKey || process.env.ANTHROPIC_API_KEY;
    if (!key) {
      throw new Error(
        "ANTHROPIC_API_KEY must be provided or set in environment"
      );
    }
    this.client = new Anthropic({ apiKey: key });
  }

  async complete(request: AIRequest): Promise<ContractResult<AIResponse>> {
    try {
      if (!request.messages || request.messages.length === 0) {
        return failure(
          createAgentError(
            this.agentId,
            "Messages array cannot be empty",
            ErrorCategory.VALIDATION_ERROR
          )
        );
      }

      // Build messages array, filtering out system messages
      const messages: Anthropic.MessageParam[] = request.messages
        .filter((msg) => msg.role !== "system")
        .map((msg) => ({
          role: msg.role as "user" | "assistant",
          content: msg.content,
        }));

      // Extract system prompt
      const systemPrompt =
        request.systemPrompt ||
        request.messages.find((msg) => msg.role === "system")?.content;

      const response = await this.client.messages.create({
        model: this.defaultModel,
        max_tokens: request.maxTokens || this.defaultMaxTokens,
        temperature: request.temperature || 0.7,
        system: systemPrompt,
        messages,
      });

      const content =
        response.content[0].type === "text" ? response.content[0].text : "";

      return success({
        content,
        model: response.model,
        usage: {
          inputTokens: response.usage.input_tokens,
          outputTokens: response.usage.output_tokens,
        },
      });
    } catch (error: any) {
      return failure(
        createAgentError(
          this.agentId,
          `AI completion failed: ${error.message}`,
          ErrorCategory.UNEXPECTED_ERROR,
          "AIServiceError",
          undefined,
          { originalError: error }
        )
      );
    }
  }

  async semanticSearch(
    request: SemanticSearchRequest
  ): Promise<ContractResult<SemanticSearchResult[]>> {
    try {
      if (!request.query || request.query.trim() === "") {
        return failure(
          createAgentError(
            this.agentId,
            "Query cannot be empty",
            ErrorCategory.VALIDATION_ERROR
          )
        );
      }

      if (!request.documents || request.documents.length === 0) {
        return success([]);
      }

      const topK = request.topK || 10;

      // Use AI to perform semantic ranking
      const documentsText = request.documents
        .map((doc, idx) => `[${idx}] ${doc.content}`)
        .join("\n\n");

      const prompt = `Given the following query and documents, rank the documents by relevance to the query. Return ONLY a JSON array of document indices ordered by relevance (most relevant first), limited to top ${topK} results.

Query: ${request.query}

Documents:
${documentsText}

Return format: [index1, index2, index3, ...]`;

      const response = await this.complete({
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
        maxTokens: 1024,
      });

      if (!response.success) {
        return failure(response.error);
      }

      // Parse the ranked indices
      let rankedIndices: number[];
      try {
        const jsonMatch = response.result.content.match(/\[[\d,\s]+\]/);
        if (!jsonMatch) {
          throw new Error("No valid JSON array found in response");
        }
        rankedIndices = JSON.parse(jsonMatch[0]);
      } catch (parseError) {
        // Fallback: return all documents with equal scores
        rankedIndices = request.documents.map((_, idx) => idx);
      }

      // Build results with scores
      const results: SemanticSearchResult[] = rankedIndices
        .slice(0, topK)
        .filter((idx) => idx >= 0 && idx < request.documents.length)
        .map((idx, rank) => {
          const doc = request.documents[idx];
          return {
            id: doc.id,
            content: doc.content,
            score: 1.0 - rank / rankedIndices.length, // Decreasing score
            metadata: doc.metadata,
          };
        });

      return success(results);
    } catch (error: any) {
      return failure(
        createAgentError(
          this.agentId,
          `Semantic search failed: ${error.message}`,
          ErrorCategory.UNEXPECTED_ERROR,
          "AIServiceError",
          undefined,
          { originalError: error }
        )
      );
    }
  }

  async classify(
    request: ClassificationRequest
  ): Promise<ContractResult<ClassificationResult>> {
    try {
      if (!request.text || request.text.trim() === "") {
        return failure(
          createAgentError(
            this.agentId,
            "Text cannot be empty",
            ErrorCategory.VALIDATION_ERROR
          )
        );
      }

      if (!request.categories || request.categories.length === 0) {
        return failure(
          createAgentError(
            this.agentId,
            "Categories array cannot be empty",
            ErrorCategory.VALIDATION_ERROR
          )
        );
      }

      const categoriesList = request.categories.join(", ");
      const instructions = request.instructions || "Classify this text";

      const prompt = `${instructions}

Text to classify:
${request.text}

Categories: ${categoriesList}

Respond with a JSON object in this format:
{
  "category": "the chosen category (must be one of the provided categories)",
  "confidence": 0.95,
  "reasoning": "brief explanation"
}`;

      const response = await this.complete({
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
        maxTokens: 1024,
      });

      if (!response.success) {
        return failure(response.error);
      }

      // Parse the classification result
      try {
        const jsonMatch = response.result.content.match(/\{[^}]+\}/s);
        if (!jsonMatch) {
          throw new Error("No valid JSON object found in response");
        }
        const result = JSON.parse(jsonMatch[0]);

        // Validate category is in the list
        if (!request.categories.includes(result.category)) {
          result.category = request.categories[0]; // Default to first category
        }

        return success({
          category: result.category,
          confidence: result.confidence || 0.5,
          reasoning: result.reasoning,
        });
      } catch (parseError) {
        // Fallback: return first category with low confidence
        return success({
          category: request.categories[0],
          confidence: 0.3,
          reasoning: "Failed to parse AI response, using default category",
        });
      }
    } catch (error: any) {
      return failure(
        createAgentError(
          this.agentId,
          `Classification failed: ${error.message}`,
          ErrorCategory.UNEXPECTED_ERROR,
          "AIServiceError",
          undefined,
          { originalError: error }
        )
      );
    }
  }

  async analyze(
    request: AnalysisRequest
  ): Promise<ContractResult<AnalysisResult>> {
    try {
      if (!request.content || request.content.trim() === "") {
        return failure(
          createAgentError(
            this.agentId,
            "Content cannot be empty",
            ErrorCategory.VALIDATION_ERROR
          )
        );
      }

      if (!request.instructions || request.instructions.trim() === "") {
        return failure(
          createAgentError(
            this.agentId,
            "Instructions cannot be empty",
            ErrorCategory.VALIDATION_ERROR
          )
        );
      }

      const contextStr = request.context
        ? `\n\nAdditional Context:\n${JSON.stringify(request.context, null, 2)}`
        : "";

      const prompt = `${request.instructions}

Analysis Type: ${request.analysisType}${contextStr}

Content to analyze:
${request.content}

Provide your analysis in the following JSON format:
{
  "summary": "brief summary of the analysis",
  "insights": ["insight 1", "insight 2", ...],
  "recommendations": ["recommendation 1", "recommendation 2", ...],
  "details": { "key1": "value1", "key2": "value2", ... }
}`;

      const response = await this.complete({
        messages: [{ role: "user", content: prompt }],
        temperature: 0.5,
        maxTokens: 4096,
      });

      if (!response.success) {
        return failure(response.error);
      }

      // Parse the analysis result
      try {
        const jsonMatch = response.result.content.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          throw new Error("No valid JSON object found in response");
        }
        const result = JSON.parse(jsonMatch[0]);

        return success({
          summary: result.summary || "No summary provided",
          insights: result.insights || [],
          recommendations: result.recommendations || [],
          details: result.details || {},
        });
      } catch (parseError) {
        // Fallback: return the raw response
        return success({
          summary: response.result.content.substring(0, 200),
          insights: ["AI analysis completed but response format was unexpected"],
          recommendations: [],
          details: { rawResponse: response.result.content },
        });
      }
    } catch (error: any) {
      return failure(
        createAgentError(
          this.agentId,
          `Analysis failed: ${error.message}`,
          ErrorCategory.UNEXPECTED_ERROR,
          "AIServiceError",
          undefined,
          { originalError: error }
        )
      );
    }
  }
}
