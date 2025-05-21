// Aliases for agent stub compatibility
export type IPrdAgent = PRDAgentContract; // Corrected to PRDAgentContract
export type PrdInput = PRDGenerationRequest;
export type PrdOutput = PRDGenerationResult;

// Main contract interface (add if missing)
/**
 * PURPOSE: Define the interface for generating Product Requirements Documents (PRDs) and design docs from user/agent discussions
 * DATA FLOW: PRD Agent ↔ Orchestrator ↔ User/other agents
 * INTEGRATION POINTS: Orchestrator, Checklist Agent, Knowledge Agent
 * CONTRACT VERSION: v1
 * ERROR HANDLING: PRD-specific errors with clear context and validation feedback
 */

import { AgentId, ContractResult } from "./types";

// Types of PRD sections
export enum PRDSectionType {
  OVERVIEW = "OVERVIEW",
  REQUIREMENTS = "REQUIREMENTS",
  USER_STORIES = "USER_STORIES",
  OPEN_QUESTIONS = "OPEN_QUESTIONS",
  DESIGN = "DESIGN",
  RISKS = "RISKS",
  ACCEPTANCE_CRITERIA = "ACCEPTANCE_CRITERIA",
  OTHER = "OTHER",
}

// Input for PRD generation
export interface PRDGenerationRequest {
  conversation: string; // Raw discussion text
  requirements?: string[];
  contextAgents?: AgentId[];
  format?: "MARKDOWN" | "HTML" | "JSON";
  requestingAgentId: AgentId;
}

// Output structure for PRD
export interface PRDSection {
  type: PRDSectionType;
  title: string;
  content: string;
}

export interface PRDGenerationResult {
  sections: PRDSection[];
  format: "MARKDOWN" | "HTML" | "JSON";
  generatedOn: Date;
  wordCount: number;
  issues?: Array<{
    severity: "ERROR" | "WARNING" | "INFO";
    message: string;
    location?: string;
    suggestion?: string;
  }>;
}

export interface PRDValidationResult {
  isValid: boolean;
  issues: Array<{
    severity: "ERROR" | "WARNING" | "INFO";
    message: string;
    location?: string;
    suggestion?: string;
  }>;
}

export interface PRDAgentContract {
  /**
   * Generate a PRD/design doc from a conversation and requirements
   * @param request PRD generation request
   * @returns A promise that resolves to the PRD generation result
   */
  generatePRD(
    request: PRDGenerationRequest
  ): Promise<ContractResult<PRDGenerationResult>>;

  /**
   * Validate an existing PRD for completeness and correctness
   * @param prdContent The PRD content to validate
   * @returns A promise that resolves to the validation result
   */
  validatePRD(prdContent: string): Promise<ContractResult<PRDValidationResult>>;
}
