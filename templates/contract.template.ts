/**
 * PURPOSE: Defines the contract for the {{ComponentNamePascalCase}}Agent.
 * It specifies the methods the agent exposes, along with the expected request and response structures.
 * CONTRACT VERSION: 0.1.0
 * ERROR HANDLING: Returns ContractResult with AgentError for failures.
 */

import { AgentId, ContractResult } from "./types"; // Assuming types.ts is in the same directory or adjust path

// Request Interface
export interface {{ComponentNamePascalCase}}Request {
  requestingAgentId: AgentId;
  inputData: string; // Example field: Customize or remove as needed for your agent's specific inputs.
  // Add other relevant request fields here
}

// Response Interface
export interface {{ComponentNamePascalCase}}Response {
  message: string; // Example field: Customize or remove as needed for your agent's specific outputs.
  // Add other relevant response fields here
}

// Main Contract Interface
export interface I{{ComponentNamePascalCase}}Agent {
  /**
   * Handles a request for the {{ComponentNamePascalCase}} service.
   * @param request The request object conforming to {{ComponentNamePascalCase}}Request.
   * @returns A promise that resolves to a ContractResult containing {{ComponentNamePascalCase}}Response on success, or an AgentError on failure.
   */
  handle{{ComponentNamePascalCase}}Request(request: {{ComponentNamePascalCase}}Request): Promise<ContractResult<{{ComponentNamePascalCase}}Response>>;
}
