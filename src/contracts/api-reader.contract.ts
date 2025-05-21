/**
 * PURPOSE: Defines the seam for an agent that parses and summarizes API documentation from URLs or files.
 * DATA FLOW: Receives URLs or API doc content; returns structured API summaries.
 * INTEGRATION POINTS: Orchestrator
 * CONTRACT VERSION: v1.0.0
 * ERROR HANDLING: Typically returns ContractResult which includes an `error` field of type AgentError for failures.
 */

import { AgentError, AgentId, ContractResult } from "./types"; // Added AgentId

// Aliases for agent stub compatibility - THIS IS A KEY CONVENTION
export type ApiReaderInput = ApiDocReadRequest;
export type ApiReaderOutput = ApiDocSummary;

// Define request/result interfaces
export interface ApiDocReadRequest {
  requestingAgentId: AgentId; // Added requestingAgentId
  url?: string; // URL to API documentation
  content?: string; // Raw API doc content (if not using URL)
  format?: string; // e.g., 'OpenAPI', 'Swagger', 'Markdown', etc.
}

export interface ApiDocSummary {
  title: string;
  description?: string;
  endpoints: Array<{
    path: string;
    method: string;
    summary?: string;
    parameters?: Array<{
      name: string;
      type: string;
      required: boolean;
      description?: string;
    }>;
    responses?: Array<{ code: string; description: string }>;
  }>;
}

// Define the main contract interface
export interface ApiDocReaderAgentContract {
  /**
   * Parse and summarize API documentation from a URL or content string.
   * @param request The request object, conforming to ApiReaderInput (which aliases ApiDocReadRequest).
   * @returns A promise that resolves to a ContractResult containing ApiReaderOutput (which aliases ApiDocSummary) on success, or an AgentError on failure.
   */
  readApiDoc(
    request: ApiReaderInput
  ): Promise<ContractResult<ApiReaderOutput, AgentError>>; // Used aliases
}
