/**
 * PURPOSE: [Describe the purpose of this contract]
 * DATA FLOW: [Describe the data flow between agents]
 * INTEGRATION POINTS: [List integration points/agents]
 * CONTRACT VERSION: v1
 * ERROR HANDLING: Typically returns ContractResult which includes an `error` field of type AgentError for failures.
 */

import { AgentId, ContractResult } from "./types";

// Aliases for agent stub compatibility - THIS IS A KEY CONVENTION
export type ExampleInput = ExampleRequest;
export type ExampleOutput = ExampleResult;

// Define enums for agent-specific concepts (if any)
export enum ExampleType {
  EXAMPLE = "EXAMPLE",
}

// Define request/result interfaces
export interface ExampleRequest {
  requestingAgentId: AgentId;
  // ...other fields relevant to the request
}

export interface ExampleResult {
  // ...fields relevant to the successful result
  // If the operation primarily returns a simple status or no specific data on success,
  // this interface might be minimal or even an alias to a common success type.
}

// Define the main contract interface
export interface ExampleContract {
  /**
   * [Describe the method, e.g., "Generates a design document based on requirements."]
   * @param request The request object, conforming to ExampleInput (which aliases ExampleRequest).
   * @returns A promise that resolves to a ContractResult containing ExampleOutput (which aliases ExampleResult) on success, or an AgentError on failure.
   */
  exampleMethod(request: ExampleInput): Promise<ContractResult<ExampleOutput>>;
  // Add additional methods as needed, following the same pattern
}
