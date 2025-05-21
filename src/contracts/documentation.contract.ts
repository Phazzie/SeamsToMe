// filepath: c:\Users\thump\SeemsToMe\src\contracts\documentation.contract.ts
/**
 * PURPOSE: Define the interface for documentation generation and management
 * DATA FLOW: Documentation Agent ↔ Other agents (primarily Orchestrator and Knowledge)
 * INTEGRATION POINTS: Orchestrator, Knowledge Agent
 * CONTRACT VERSION: v1
 * ERROR HANDLING: Documentation-specific errors with clear context
 */

import { AgentError, AgentId, ContractResult } from "./types"; // Added ContractResult, AgentError

// Aliases for Orchestrator and Agent stub compatibility
export type DocumentationInput = DocumentationRequest;
export type DocumentationOutput = DocumentationResult;
export type ValidateDocumentationInput = {
  docPath: string;
  sources: DocumentationSource[];
}; // Combined for simplicity if used as a single param object
export type ValidateDocumentationOutput = DocumentationValidationResult;
export type UpdateDocumentationInput = {
  docPath: string;
  sources: DocumentationSource[];
  preserveSections?: string[];
};
export type UpdateDocumentationOutput = DocumentationResult;
export type ExtractBlueprintCommentsInput = { sourcePaths: string[] };
export type ExtractBlueprintCommentsOutput = Array<{
  path: string;
  comments: Array<{
    content: string;
    location: string;
    type:
      | "PURPOSE"
      | "DATA_FLOW"
      | "INTEGRATION_POINTS"
      | "CONTRACT_VERSION"
      | "ERROR_HANDLING"
      | "OTHER";
  }>;
}>;

export enum DocumentationType {
  CONTRACT = "CONTRACT",
  SEAM = "SEAM",
  AGENT = "AGENT",
  USER_GUIDE = "USER_GUIDE",
  API_REFERENCE = "API_REFERENCE",
  ARCHITECTURE = "ARCHITECTURE",
  CHANGELOG = "CHANGELOG",
}

export enum DocumentationFormat {
  MARKDOWN = "MARKDOWN",
  HTML = "HTML",
  JSON = "JSON",
  MERMAID = "MERMAID",
  TYPESCRIPT = "TYPESCRIPT",
}

export interface DocumentationSource {
  path: string;
  type: "FILE" | "DIRECTORY" | "STRING";
  content?: string; // Only needed for type=STRING
}

export interface DocumentationRequest {
  docType: DocumentationType;
  sources: DocumentationSource[];
  format: DocumentationFormat;
  requestingAgentId: AgentId;
  includeSubsections?: boolean;
  templatePath?: string;
}

export interface DocumentationResult {
  content: string;
  format: DocumentationFormat;
  metadata: {
    generatedOn: Date;
    docType: DocumentationType;
    wordCount?: number;
    generationTime: number;
  };
}

export interface DocumentationValidationResult {
  isValid: boolean;
  issues: Array<{
    severity: "ERROR" | "WARNING" | "INFO";
    message: string;
    location?: string;
    suggestion?: string;
  }>;
}

export interface DocumentationContract {
  /**
   * Generate documentation based on sources
   * @param request Documentation generation request
   * @returns A promise that resolves to the documentation result
   */
  generateDocumentation(
    request: DocumentationInput
  ): Promise<ContractResult<DocumentationOutput, AgentError>>;

  /**
   * Validate existing documentation against sources
   * @param docPath Path to the documentation file
   * @param sources Source files/directories to validate against
   * @returns A promise that resolves to the validation result
   */
  validateDocumentation(
    docPath: string,
    sources: DocumentationSource[]
  ): Promise<ContractResult<ValidateDocumentationOutput, AgentError>>;

  /**
   * Update existing documentation with changes
   * @param docPath Path to the documentation file to update
   * @param sources Updated source files/directories
   * @param preserveSections Optional sections to preserve (by heading)
   * @returns A promise that resolves to the updated documentation
   */
  updateDocumentation(
    docPath: string,
    sources: DocumentationSource[],
    preserveSections?: string[]
  ): Promise<ContractResult<UpdateDocumentationOutput, AgentError>>;

  /**
   * Extract blueprint comments from source files
   * @param sourcePaths Paths to source files to extract from
   * @returns A promise that resolves to extracted blueprint comments
   */
  extractBlueprintComments(
    sourcePaths: string[]
  ): Promise<ContractResult<ExtractBlueprintCommentsOutput, AgentError>>;
}
