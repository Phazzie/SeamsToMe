// filepath: c:\Users\thump\SeemsToMe\src\contracts\types.ts
/**
 * PURPOSE: Shared type definitions for the multi-agent ecosystem
 * DATA FLOW: Used across all agents
 * INTEGRATION POINTS: All contracts
 * CONTRACT VERSION: v1
 * ERROR HANDLING: N/A (type definitions only)
 */

// Agent identification
export type AgentId = string;

// Task identification and status
export type TaskId = string;

export enum TaskStatus {
  PENDING = "PENDING",
  PROCESSING = "PROCESSING",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
  CANCELLED = "CANCELLED",
  TIMEOUT = "TIMEOUT",
}

export enum TaskPriority {
  LOW = "LOW",
  NORMAL = "NORMAL",
  HIGH = "HIGH",
  CRITICAL = "CRITICAL",
}

// Error types
export enum ErrorCategory {
  CONTRACT_VIOLATION = "CONTRACT_VIOLATION",
  AGENT_UNAVAILABLE = "AGENT_UNAVAILABLE",
  VALIDATION_ERROR = "VALIDATION_ERROR",
  BUSINESS_LOGIC_ERROR = "BUSINESS_LOGIC_ERROR",
  TIMEOUT_ERROR = "TIMEOUT_ERROR",
  UNEXPECTED_ERROR = "UNEXPECTED_ERROR",
  INVALID_REQUEST = "INVALID_REQUEST", // Added INVALID_REQUEST
  FILE_SYSTEM_ERROR = "FILE_SYSTEM_ERROR", // Added for file system related errors
  OPERATION_FAILED = "OPERATION_FAILED", // Added
  INTERNAL_ERROR = "INTERNAL_ERROR", // Added
  NOT_IMPLEMENTED = "NOT_IMPLEMENTED", // Added NOT_IMPLEMENTED
  BAD_REQUEST = "BAD_REQUEST", // Added BAD_REQUEST (already present, but ensuring it's here for clarity)
}
export interface AgentError {
  name: string;
  message: string;
  category: ErrorCategory;
  agentId: AgentId;
  taskId?: TaskId;
  details?: any; // Changed from Record<string, any> to any
  requestingAgentId?: AgentId; // Added: To track who made the request
  data?: any; // Added: For arbitrary data related to the error, like the original request
  methodName?: string; // Added
}

// Helper function to create an AgentError object
export function createAgentError(
  agentId: AgentId,
  message: string,
  category: ErrorCategory,
  name: string = "AgentError", // Default name
  requestingAgentId?: AgentId,
  details?: any, // Changed from 'data' to 'details' to match interface
  taskId?: TaskId
): AgentError {
  return {
    name,
    agentId,
    message,
    category,
    requestingAgentId,
    details,
    taskId,
  };
}

// Add the new NotImplementedError interface
export interface NotImplementedError extends AgentError {
  methodName: string;
  requestingAgentId?: AgentId; // Added to match usage in refactor.contract.test.ts
}

// Helper function to create a NotImplementedError object
export function createNotImplementedError(
  agentId: AgentId,
  methodName: string,
  requestingAgentId?: AgentId,
  message?: string // Optional custom message
): NotImplementedError {
  return {
    name: "NotImplementedError",
    agentId,
    message: message || `Method '${methodName}' is not implemented.`,
    category: ErrorCategory.NOT_IMPLEMENTED, // Changed to NOT_IMPLEMENTED
    methodName,
    requestingAgentId,
  };
}

// Defines the general structure for the result of a contract method call.
// It can either be a success, in which case 'result' will contain the output,
// or a failure, in which case 'error' will contain an AgentError.
export type ContractResult<T, E extends AgentError = AgentError> =
  | { success: true; result: T; error?: undefined }
  | { success: false; result?: undefined; error: E };

// Helper function to create a success ContractResult
export function success<T, E extends AgentError = AgentError>(
  result: T
): ContractResult<T, E> {
  return { success: true, result };
}

// Helper function to create a failure ContractResult
export function failure<T, E extends AgentError = AgentError>(
  error: E
): ContractResult<T, E> {
  return { success: false, error };
}

// Type guard to check if an object is an AgentError
export function isAgentError(obj: any): obj is AgentError {
  return (
    obj &&
    typeof obj.name === "string" &&
    typeof obj.message === "string" &&
    typeof obj.agentId === "string" &&
    Object.values(ErrorCategory).includes(obj.category)
  );
}
