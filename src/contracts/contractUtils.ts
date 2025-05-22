/**
 * PURPOSE: Utility functions for handling contract results.
 * DATA FLOW: Used by agents to return standardized success/failure responses.
 * INTEGRATION POINTS: Agent implementations.
 * CONTRACT VERSION: v1
 * ERROR HANDLING: N/A (utility functions)
 */

import { AgentError } from "./types";

export interface ContractResult<TSuccess, TError extends AgentError> {
  success: boolean;
  result?: TSuccess;
  error?: TError;
}

export function success<TSuccess, TError extends AgentError>(
  result: TSuccess
): ContractResult<TSuccess, TError> {
  return { success: true, result };
}

export function failure<TSuccess, TError extends AgentError>(
  error: TError
): ContractResult<TSuccess, TError> {
  return { success: false, error };
}
