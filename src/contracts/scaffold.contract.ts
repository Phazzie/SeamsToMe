// Aliases for agent stub compatibility
export type IScaffoldAgent = StubAgentContract; // Corrected to StubAgentContract
export type ScaffoldInput = StubGenerationRequest;
export type ScaffoldOutput = StubGenerationResult;
export type ValidateStubsInput = ValidateStubsRequest;
export type ValidateStubsOutput = StubValidationResult;

/**
 * PURPOSE: Define the interface for generating file stubs and scaffolding for components and seams
 * DATA FLOW: Stub Agent ↔ Orchestrator ↔ PRD Agent
 * INTEGRATION POINTS: Orchestrator, PRD Agent
 * CONTRACT VERSION: v1
 * ERROR HANDLING: Typically returns ContractResult which includes an `error` field of type AgentError for failures.
 */

import { AgentId, ContractResult } from "./types"; // Added ContractResult, AgentError

export enum StubFormat {
  TYPESCRIPT = "TYPESCRIPT",
  MARKDOWN = "MARKDOWN",
  JSON = "JSON",
  OTHER = "OTHER",
}

export interface StubGenerationRequest {
  designDoc: string; // PRD or design doc text
  targetPath: string;
  format: StubFormat;
  requestingAgentId: AgentId;
}

export interface StubFile {
  path: string;
  content: string;
  format: StubFormat;
}

export interface StubGenerationResult {
  files: StubFile[];
  issues?: Array<{
    severity: "ERROR" | "WARNING" | "INFO";
    message: string;
    location?: string;
    suggestion?: string;
  }>;
}

export interface ValidateStubsRequest {
  files: StubFile[];
  requestingAgentId: AgentId;
}

export interface StubValidationResult {
  isValid: boolean;
  issues: Array<{
    severity: "ERROR" | "WARNING" | "INFO";
    message: string;
    location?: string;
    suggestion?: string;
  }>;
}

export interface StubAgentContract {
  /**
   * Generate file stubs from a design doc
   * @param request Stub generation request, conforming to ScaffoldInput.
   * @returns A promise that resolves to a ContractResult containing ScaffoldOutput on success, or an AgentError on failure.
   */
  generateScaffold(
    request: ScaffoldInput
  ): Promise<ContractResult<ScaffoldOutput>>; // Updated return type

  /**
   * Validate generated stubs for completeness and correctness
   * @param request The request object, conforming to ValidateStubsInput.
   * @returns A promise that resolves to a ContractResult containing ValidateStubsOutput on success, or an AgentError on failure.
   */
  validateStubs(
    request: ValidateStubsInput
  ): Promise<ContractResult<ValidateStubsOutput>>; // Updated parameters and return type
}
