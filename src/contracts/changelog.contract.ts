// filepath: c:\Users\thump\SeemsToMe\src\contracts\changelog.contract.ts
/**
 * PURPOSE: Define the interface for the Changelog Agent that tracks and documents changes
 * DATA FLOW: Changelog Agent ↔ Other agents (primarily Orchestrator)
 * INTEGRATION POINTS: Orchestrator, Documentation Agent
 * CONTRACT VERSION: v1
 * ERROR HANDLING: Changelog errors are reported with appropriate context
 */

import { AgentError, AgentId, ContractResult } from "./types"; // Added ContractResult, AgentError

// Aliases for Orchestrator and Agent stub compatibility
export type ChangelogInput = ChangelogRequest;
export type ChangelogOutput = ChangelogResponse;
export type RecordChangeInput = RecordChangeRequest;
export type RecordChangeOutput = string; // Change ID
export type BreakingChangesOutput = ChangeRecord[];
export type GenerateChangelogOutput = string;
export type TurnoverMessageOutput = string;

export enum ChangeType {
  FEATURE = "FEATURE",
  BUGFIX = "BUGFIX",
  CONTRACT_CHANGE = "CONTRACT_CHANGE",
  REFACTOR = "REFACTOR",
  DOCUMENTATION = "DOCUMENTATION",
  TEST = "TEST",
  BUILD = "BUILD",
}

export enum ChangeImpact {
  NONE = "NONE",
  MINOR = "MINOR",
  MODERATE = "MODERATE",
  MAJOR = "MAJOR",
  BREAKING = "BREAKING",
}

export interface ChangeRecord {
  id: string;
  type: ChangeType;
  description: string;
  files: string[];
  impact: ChangeImpact;
  agentId: AgentId;
  timestamp: Date;
  relatedContracts?: string[];
  breaking: boolean;
  migrationGuidance?: string;
}

export interface RecordChangeRequest {
  type: ChangeType;
  description: string;
  files: string[];
  impact: ChangeImpact;
  agentId: AgentId;
  relatedContracts?: string[];
  breaking: boolean;
  migrationGuidance?: string;
}

export interface ChangelogRequest {
  since?: Date;
  until?: Date;
  types?: ChangeType[];
  impactLevel?: ChangeImpact;
  agentId?: AgentId;
  contract?: string;
  includeBreakingOnly?: boolean;
}

export interface ChangelogResponse {
  changes: ChangeRecord[];
  totalChanges: number;
  breakingChanges: number;
}

export interface TurnoverMessageRequest {
  projectName?: string;
  timeRange?: {
    since?: Date;
    until?: Date;
  };
  includeValidationCommands?: boolean;
  includeNextSteps?: boolean;
  includeKnownIssues?: boolean;
  format?: "markdown" | "text";
}

export interface ChangelogContract {
  /**
   * Record a new change in the system
   * @param request The change to record
   * @returns A promise that resolves to the ID of the recorded change
   */
  recordChange(
    request: RecordChangeInput
  ): Promise<ContractResult<RecordChangeOutput, AgentError>>;

  /**
   * Get changes matching the specified criteria
   * @param request The filtering criteria
   * @returns A promise that resolves to the changelog response
   */
  getChanges(
    request: ChangelogInput
  ): Promise<ContractResult<ChangelogOutput, AgentError>>;

  /**
   * Generate a formatted changelog
   * @param request The filtering criteria
   * @param format The format to generate (markdown, html, etc)
   * @returns A promise that resolves to the formatted changelog
   */
  generateChangelog(
    request: ChangelogInput,
    format: string
  ): Promise<ContractResult<GenerateChangelogOutput, AgentError>>;
  /**
   * Get breaking changes that require migration
   * @param since Optional date to check from
   * @returns A promise that resolves to breaking changes with migration guidance
   */
  getBreakingChanges(
    since?: Date
  ): Promise<ContractResult<BreakingChangesOutput, AgentError>>;

  /**
   * Generate a comprehensive turnover message for project handoff
   * @param request The turnover message configuration
   * @returns A promise that resolves to the formatted turnover message
   */
  generateTurnoverMessage(
    request: TurnoverMessageRequest
  ): Promise<ContractResult<TurnoverMessageOutput, AgentError>>;
}
