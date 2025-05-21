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
}
export interface AgentError {
  name: string;
  message: string;
  category: ErrorCategory;
  agentId: AgentId;
  taskId?: TaskId;
  details?: Record<string, any>;
  requestingAgentId?: AgentId; // Added: To track who made the request
  data?: any; // Added: For arbitrary data related to the error, like the original request
}

// Helper function to create an AgentError object
export function createAgentError(
  agentId: AgentId,
  message: string,
  category: ErrorCategory,
  name: string = "AgentError", // Default name
  requestingAgentId?: AgentId,
  details?: Record<string, any>, // Changed from 'data' to 'details' to match interface
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
    category: ErrorCategory.UNEXPECTED_ERROR, // Or a more specific category if available
    methodName,
    requestingAgentId,
  };
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

// Generic contract result type for agent responses
export type ContractResult<T, E = AgentError> =
  | { success: true; result: T; error?: undefined }
  | { success: false; error: E; result?: undefined };
