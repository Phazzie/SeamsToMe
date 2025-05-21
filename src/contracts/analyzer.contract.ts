/**
 * PURPOSE: Define the interface for analyzing seams, contracts, and integrations in the codebase
 * DATA FLOW: Analyzer Agent ↔ Orchestrator ↔ PRD Agent
 * INTEGRATION POINTS: Orchestrator, PRD Agent, Stub Agent
 * CONTRACT VERSION: v1
 * ERROR HANDLING: Typically returns ContractResult which includes an `error` field of type AgentError for failures.
 */

import { AgentId, ContractResult } from "./types"; // Added ContractResult, AgentError

// Aliases for agent stub compatibility - THIS IS A KEY CONVENTION
export type AnalyzerInput = SeamAnalysisRequest;
export type AnalyzerOutput = SeamAnalysisResult;

// Define request/result interfaces
export interface SeamAnalysisRequest {
  codebasePath: string;
  docsPath?: string;
  requestingAgentId: AgentId;
}

export interface SeamInfo {
  seamId: string;
  agents: AgentId[];
  description: string;
  status: "ACTIVE" | "DEPRECATED" | "PLANNED";
  riskLevel?: "LOW" | "MEDIUM" | "HIGH";
}

export interface SeamAnalysisResult {
  seams: SeamInfo[];
  issues?: Array<{
    severity: "ERROR" | "WARNING" | "INFO";
    message: string;
    location?: string;
    suggestion?: string;
  }>;
}

// Define the main contract interface
export interface AnalyzerAgentContract {
  /**
   * Analyze the codebase and docs to identify seams and integration points.
   * @param request The request object, conforming to AnalyzerInput (which aliases SeamAnalysisRequest).
   * @returns A promise that resolves to a ContractResult containing AnalyzerOutput (which aliases SeamAnalysisResult) on success, or an AgentError on failure.
   */
  analyzeSeams(request: AnalyzerInput): Promise<ContractResult<AnalyzerOutput>>;
}
