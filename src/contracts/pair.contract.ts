/**
 * PURPOSE: Defines the seam for an agent that assists with code generation, suggestions, and collaborative programming tasks.
 * DATA FLOW: Receives contracts, stubs, requirements; returns code suggestions or generated code.
 * INTEGRATION POINTS: Orchestrator
 * CONTRACT VERSION: v1.0.0
 * ERROR HANDLING: Typically returns ContractResult which includes an `error` field of type AgentError for failures.
 */

import { AgentError, AgentId, ContractResult } from "./types"; // Added AgentId

// Aliases for agent stub compatibility - THIS IS A KEY CONVENTION
export type IPairAgent = PairProgrammingAgentContract;
export type PairInput = PairProgrammingRequest;
export type PairOutput = PairProgrammingResult;

/**
 * AI Pair Programmer Agent Contract
 *
 * Purpose: Defines the seam for an agent that assists with code generation, suggestions, and collaborative programming tasks.
 * Participants: Orchestrator, AI Pair Programmer Agent
 * Data Flow: Receives contracts, stubs, requirements; returns code suggestions or generated code.
 * Error Handling: Returns structured error objects for invalid input, generation failures, or unsupported tasks.
 * Version: 1.0.0
 * Rationale: Enables collaborative, AI-assisted code authoring and review.
 */

export interface PairProgrammingRequest {
  requestingAgentId: AgentId; // Added requestingAgentId
  contract: string; // Contract or interface to implement
  stub?: string; // Optional stub or partial implementation
  requirements?: string; // Additional requirements or context
  language: string; // Target programming language
}

export interface PairProgrammingResult {
  generatedCode: string;
  rationale?: string;
  suggestions?: string[];
}

export interface PairProgrammingAgentContract {
  /**
   * Generate code or suggestions based on contract, stubs, and requirements.
   * @param request The request object, conforming to PairInput (which aliases PairProgrammingRequest).
   * @returns A promise that resolves to a ContractResult containing PairOutput (which aliases PairProgrammingResult) on success, or an AgentError on failure.
   */
  generateCode(
    request: PairInput
  ): Promise<ContractResult<PairOutput, AgentError>>; // Used aliases
}
