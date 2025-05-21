/**
 * PURPOSE: Defines the seam for an agent that generates refactoring plans and applies code transformations.
 * DATA FLOW: Receives code and seam map; returns refactoring plan and/or transformed code.
 * INTEGRATION POINTS: Orchestrator
 * CONTRACT VERSION: v1.0.0
 * ERROR HANDLING: Typically returns ContractResult which includes an `error` field of type AgentError for failures.
 */

import { AgentError, AgentId, ContractResult } from "./types"; // Added AgentId

// Aliases for agent stub compatibility - THIS IS A KEY CONVENTION
export type RefactorInput = RefactorRequest;
export type RefactorOutput = RefactorPlan;

// Define request/result interfaces
export interface RefactorRequest {
  requestingAgentId: AgentId; // Added requestingAgentId
  code: string;
  seamMap?: string; // Optional seam map or analysis result
  goals?: string[]; // Refactoring goals (e.g., "extract method", "modularize")
}

export interface RefactorPlan {
  summary: string;
  steps: Array<{
    description: string;
    before: string;
    after: string;
  }>;
  transformedCode?: string;
}

// Define the main contract interface
export interface RefactoringAssistantAgentContract {
  /**
   * Generate a refactoring plan and optionally apply code transformations.
   * @param request The request object, conforming to RefactorInput (which aliases RefactorRequest).
   * @returns A promise that resolves to a ContractResult containing RefactorOutput (which aliases RefactorPlan) on success, or an AgentError on failure.
   */
  refactor(
    request: RefactorInput
  ): Promise<ContractResult<RefactorOutput, AgentError>>; // Used aliases
}
