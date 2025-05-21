/**
 * PURPOSE: Define the interface for quality checking, SDD compliance, and documentation health
 * DATA FLOW: Quality Agent ↔ Orchestrator ↔ All agents
 * INTEGRATION POINTS: Orchestrator, Checklist Agent, Documentation Agent
 * CONTRACT VERSION: v1
 * ERROR HANDLING: Typically returns ContractResult which includes an `error` field of type AgentError for failures.
 */

import { AgentId, ContractResult } from "./types"; // Added ContractResult, AgentError

// Aliases for agent stub compatibility - THIS IS A KEY CONVENTION
export type QualityInput = QualityCheckRequest;
export type QualityOutput = QualityCheckResult;

// Define enums for agent-specific concepts
export enum QualityCheckType {
  SDD_COMPLIANCE = "SDD_COMPLIANCE",
  CODE_QUALITY = "CODE_QUALITY",
  DOC_HEALTH = "DOC_HEALTH",
  OTHER = "OTHER",
}

// Define request/result interfaces
export interface QualityCheckRequest {
  targetPath: string;
  checkTypes: QualityCheckType[];
  requestingAgentId: AgentId;
}

export interface QualityIssue {
  type: QualityCheckType;
  message: string;
  severity: "ERROR" | "WARNING" | "INFO";
  location?: string;
  suggestion?: string;
}

export interface QualityCheckResult {
  issues: QualityIssue[];
  summary: string;
  checkedOn: Date;
}

// Define the main contract interface
export interface QualityAgentContract {
  /**
   * Run quality checks on a target path.
   * @param request The request object, conforming to QualityInput (which aliases QualityCheckRequest).
   * @returns A promise that resolves to a ContractResult containing QualityOutput (which aliases QualityCheckResult) on success, or an AgentError on failure.
   */
  checkQuality(request: QualityInput): Promise<ContractResult<QualityOutput>>; // Updated parameter type and return type
}
