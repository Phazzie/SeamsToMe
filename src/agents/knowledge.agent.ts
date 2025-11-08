/**
 * PURPOSE: Provide knowledge retrieval and storage capabilities
 * DATA FLOW: Knowledge Agent ↔ Requesting agents
 * INTEGRATION POINTS: Orchestrator, Documentation Agent
 * CONTRACT VERSION: v1
 * ERROR HANDLING: Knowledge-specific errors with detailed context
 */

import {
  HasKnowledgeOutput,
  KnowledgeContract,
  KnowledgeDomain,
  KnowledgeInput,
  KnowledgeItem,
  KnowledgeOutput,
  StoreKnowledgeInput,
  StoreKnowledgeOutput,
} from "../contracts/knowledge.contract";
import {
  AgentError,
  AgentId,
  ContractResult,
  success,
  failure,
} from "../contracts/types";
import { IAIService } from "../contracts/ai-service.contract";
import { BaseAgent } from "./base.agent";

/**
 * Knowledge Agent - AI-Powered Implementation
 *
 * Uses semantic search for intelligent knowledge retrieval.
 * Replaces keyword matching heuristics with AI-powered similarity.
 */
export class KnowledgeAgent extends BaseAgent implements KnowledgeContract {
  protected readonly agentId = "knowledge-agent" as const;
  private knowledgeStore: Map<string, KnowledgeItem> = new Map();
  private aiService?: IAIService;

  constructor(aiService?: IAIService) {
    super();
    this.aiService = aiService;
  }

  /**
   * Retrieve knowledge based on a query
   * Uses AI-powered semantic search for intelligent retrieval
   */
  async retrieveKnowledge(
    request: KnowledgeInput
  ): Promise<ContractResult<KnowledgeOutput, AgentError>> {
    return this.withErrorHandling(async () => {
      // Validate request and query
      const agentId = request.requestingAgentId;
      if (!this.validateRequest(request, agentId)) {
        return failure(
          this.createValidationError("request", "Request is required", agentId)
        );
      }

      const validation = this.validateFields({
        query: { value: request.query, type: "nonEmpty" },
      }, request.requestingAgentId);
      if (!validation.success) return validation;

      const startTime = Date.now();

      // Filter by domain if specified
      let candidateItems = Array.from(this.knowledgeStore.values());
      if (request.domain) {
        candidateItems = candidateItems.filter(
          (item) => item.metadata.domain === request.domain
        );
      }

      if (candidateItems.length === 0) {
        return success({
          items: [],
          totalResults: 0,
          query: request.query,
          executionTime: Date.now() - startTime,
        });
      }

      // Use AI semantic search if available, otherwise fall back to keyword matching
      let matchingItems: KnowledgeItem[] = [];

      if (this.aiService) {
        // AI-powered semantic search
        const documents = candidateItems.map((item) => ({
          id: item.id,
          content: item.content,
          metadata: item.metadata,
        }));

        const searchResult = await this.aiService.semanticSearch({
          query: request.query,
          documents,
          topK: request.maxResults || 10,
        });

        if (searchResult.success) {
          // Map search results back to KnowledgeItems
          matchingItems = searchResult.result
            .map((result) => this.knowledgeStore.get(result.id))
            .filter((item): item is KnowledgeItem => item !== undefined);
        } else {
          // AI search failed, fall back to keyword matching
          matchingItems = this.keywordSearch(candidateItems, request.query);
        }
      } else {
        // No AI service available, use keyword matching
        matchingItems = this.keywordSearch(candidateItems, request.query);
      }

      const executionTime = Date.now() - startTime;

      return success({
        items: matchingItems.slice(0, request.maxResults || 10),
        totalResults: matchingItems.length,
        query: request.query,
        executionTime,
      });
    }, "retrieveKnowledge", request.requestingAgentId);
  }

  /**
   * Fallback keyword search when AI is not available
   */
  private keywordSearch(items: KnowledgeItem[], query: string): KnowledgeItem[] {
    return items.filter((item) =>
      item.content.toLowerCase().includes(query.toLowerCase())
    );
  }

  /**
   * Store new knowledge in the system
   */
  async storeKnowledge(
    item: StoreKnowledgeInput,
    agentId: AgentId
  ): Promise<ContractResult<StoreKnowledgeOutput, AgentError>> {
    return this.withErrorHandling(async () => {
      // Validate item and required fields
      if (!this.validateRequest(item, agentId)) {
        return failure(
          this.createValidationError("item", "Item is required", agentId)
        );
      }

      const validation = this.validateFields({
        content: { value: item.content, type: "nonEmpty" },
      }, agentId);
      if (!validation.success) return validation;

      // Generate a simple ID (would be more sophisticated in real implementation)
      const id = `knowledge-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

      const knowledgeItem: KnowledgeItem = {
        ...item,
        id,
      };

      this.knowledgeStore.set(id, knowledgeItem);

      return success(id);
    }, "storeKnowledge", agentId);
  }

  /**
   * Check if knowledge exists for a specific query
   * Uses AI-powered semantic matching for intelligent detection
   */
  async hasKnowledge(
    query: string,
    domain?: KnowledgeDomain
  ): Promise<ContractResult<HasKnowledgeOutput, AgentError>> {
    return this.withErrorHandling(async () => {
      // Validate query
      if (!this.validateNonEmpty(query, "query")) {
        return failure(
          this.createValidationError("query", "query cannot be empty")
        );
      }

      // Filter by domain if specified
      let candidateItems = Array.from(this.knowledgeStore.values());
      if (domain) {
        candidateItems = candidateItems.filter(
          (item) => item.metadata.domain === domain
        );
      }

      if (candidateItems.length === 0) {
        return success(false);
      }

      // Use AI semantic search if available with topK=1 to check for relevant matches
      if (this.aiService) {
        const documents = candidateItems.map((item) => ({
          id: item.id,
          content: item.content,
          metadata: item.metadata,
        }));

        const searchResult = await this.aiService.semanticSearch({
          query,
          documents,
          topK: 1,
        });

        if (searchResult.success && searchResult.result.length > 0) {
          // Consider it a match if the top result has a score > 0.5
          return success(searchResult.result[0].score > 0.5);
        }
      }

      // Fallback: keyword matching
      for (const item of candidateItems) {
        if (item.content.toLowerCase().includes(query.toLowerCase())) {
          return success(true);
        }
      }

      return success(false);
    }, "hasKnowledge");
  }
}
