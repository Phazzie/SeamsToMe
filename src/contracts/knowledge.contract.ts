// filepath: c:\Users\thump\SeemsToMe\src\contracts\knowledge.contract.ts
/**
 * PURPOSE: Define the interface for knowledge retrieval and management
 * DATA FLOW: Knowledge Agent ↔ Other agents
 * INTEGRATION POINTS: Orchestrator, Documentation Agent
 * CONTRACT VERSION: v1
 * ERROR HANDLING: Knowledge-specific errors are reported back to calling agents
 */

import { AgentError, AgentId, ContractResult } from "./types";

// Aliases for Orchestrator and Agent stub compatibility
export type KnowledgeInput = KnowledgeRequest;
export type KnowledgeOutput = KnowledgeResponse;
export type StoreKnowledgeInput = Omit<KnowledgeItem, "id">;
export type StoreKnowledgeOutput = string;
export type HasKnowledgeInput = { query: string; domain?: KnowledgeDomain };
export type HasKnowledgeOutput = boolean;

export enum KnowledgeDomain {
  TECHNICAL = "TECHNICAL",
  BUSINESS = "BUSINESS",
  PROCESS = "PROCESS",
  DOMAIN_SPECIFIC = "DOMAIN_SPECIFIC",
}

export enum KnowledgeFormat {
  TEXT = "TEXT",
  MARKDOWN = "MARKDOWN",
  JSON = "JSON",
  HTML = "HTML",
}

export interface KnowledgeRequest {
  query: string;
  domain?: KnowledgeDomain;
  context?: Record<string, any>;
  requestingAgentId: AgentId;
  format?: KnowledgeFormat;
  maxResults?: number;
}

export interface KnowledgeItem {
  id: string;
  content: string;
  metadata: {
    source: string;
    confidence: number;
    timestamp: Date;
    domain: KnowledgeDomain;
    tags?: string[];
  };
  format: KnowledgeFormat;
}

export interface KnowledgeResponse {
  items: KnowledgeItem[];
  totalResults: number;
  query: string;
  executionTime: number;
}

export interface KnowledgeContract {
  /**
   * Retrieve knowledge based on a query
   * @param request The knowledge request
   * @returns A promise that resolves to the knowledge response
   */
  retrieveKnowledge(
    request: KnowledgeInput
  ): Promise<ContractResult<KnowledgeOutput, AgentError>>;

  /**
   * Store new knowledge in the system
   * @param item The knowledge item to store
   * @param agentId The ID of the agent storing the knowledge
   * @returns A promise that resolves to the ID of the stored knowledge item
   */
  storeKnowledge(
    item: StoreKnowledgeInput,
    agentId: AgentId
  ): Promise<ContractResult<StoreKnowledgeOutput, AgentError>>;

  /**
   * Check if knowledge exists for a specific query
   * @param query The query to check
   * @param domain Optional domain to restrict the search
   * @returns A promise that resolves to true if knowledge exists
   */
  hasKnowledge(
    query: string,
    domain?: KnowledgeDomain
  ): Promise<ContractResult<HasKnowledgeOutput, AgentError>>;
}
