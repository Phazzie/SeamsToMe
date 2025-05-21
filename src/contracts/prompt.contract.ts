/**
 * PURPOSE: Defines the seam for an agent that generates prompts for LLMs or other agents based on contracts and documentation.
 * DATA FLOW: Receives contracts, documentation, or context; returns prompts for downstream agents or LLMs.
 * INTEGRATION POINTS: Orchestrator
 * CONTRACT VERSION: v1.0.0
 * ERROR HANDLING: Typically returns ContractResult which includes an `error` field of type AgentError for failures.
 */

import { AgentError, AgentId, ContractResult } from "./types"; // Added AgentId

// Aliases for agent stub compatibility - THIS IS A KEY CONVENTION
export type IPromptAgent = PromptGeneratorAgentContract;
export type PromptInput = PromptGenerationRequest;
export type PromptOutput = PromptGenerationResult;
// Added for executePrompt method
export type PromptExecutionInput = {
  prompt: string;
  context?: Record<string, any>; // Optional context for prompt execution
  requestingAgentId: AgentId;
};
export type PromptExecutionOutput = {
  response: string; // The response from executing the prompt
  metrics?: Record<string, any>; // Optional metrics like tokens used, latency
};

/**
 * Prompt Generator Agent Contract
 *
 * Purpose: Defines the seam for an agent that generates prompts for LLMs or other agents based on contracts and documentation.
 * Participants: Orchestrator, Prompt Generator Agent
 * Data Flow: Receives contracts, documentation, or context; returns prompts for downstream agents or LLMs.
 * Error Handling: Returns structured error objects for invalid input or prompt generation failures.
 * Version: 1.0.0
 * Rationale: Centralizes and standardizes prompt creation for consistent agent/LLM interaction.
 */

export interface PromptGenerationRequest {
  requestingAgentId: AgentId; // Added requestingAgentId
  contract: string; // Contract or interface to generate prompt for
  documentation?: string; // Optional documentation/context
  taskType?: string; // e.g., 'code-gen', 'review', etc.
}

export interface PromptGenerationResult {
  prompt: string;
  rationale?: string;
}

export interface PromptGeneratorAgentContract {
  /**
   * Generate a prompt for a given contract, documentation, and task type.
   * @param request The request object, conforming to PromptInput (which aliases PromptGenerationRequest).
   * @returns A promise that resolves to a ContractResult containing PromptOutput (which aliases PromptGenerationResult) on success, or an AgentError on failure.
   */
  generatePrompt(
    request: PromptInput
  ): Promise<ContractResult<PromptOutput, AgentError>>; // Used aliases

  /**
   * Execute a given prompt, potentially with additional context.
   * @param request The request object, conforming to PromptExecutionInput.
   * @returns A promise that resolves to a ContractResult containing PromptExecutionOutput on success, or an AgentError on failure.
   */
  executePrompt(
    request: PromptExecutionInput
  ): Promise<ContractResult<PromptExecutionOutput, AgentError>>;
}
