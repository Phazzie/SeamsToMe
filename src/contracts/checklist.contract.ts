// filepath: c:\Users\thump\SeemsToMe\src\contracts\checklist.contract.ts
/**
 * PURPOSE: Define the interface for the Checklist Agent that verifies SDD compliance
 * DATA FLOW: Checklist Agent ↔ Other agents (primarily Orchestrator)
 * INTEGRATION POINTS: Orchestrator, Quality Agent
 * CONTRACT VERSION: v1
 * ERROR HANDLING: Checklist errors are reported with clear context and remediation suggestions
 */

import { AgentError, AgentId, ContractResult } from "./types"; // Added ContractResult, AgentError

// Aliases for Orchestrator and Agent stub compatibility
export type ChecklistInput = ChecklistRequest;
export type ChecklistOutput = ChecklistResponse;
export type CategoriesOutput = ChecklistCategory[];
export type ReportOutput = string;

export enum ChecklistCategory {
  CONTRACT_DEFINITION = "CONTRACT_DEFINITION",
  STUB_IMPLEMENTATION = "STUB_IMPLEMENTATION",
  DOCUMENTATION = "DOCUMENTATION",
  TESTING = "TESTING",
  CODE_QUALITY = "CODE_QUALITY",
  ERROR_HANDLING = "ERROR_HANDLING",
}

export enum ComplianceStatus {
  COMPLIANT = "COMPLIANT",
  PARTIALLY_COMPLIANT = "PARTIALLY_COMPLIANT",
  NOT_COMPLIANT = "NOT_COMPLIANT",
  NEEDS_REVIEW = "NEEDS_REVIEW",
  NOT_APPLICABLE = "NOT_APPLICABLE",
}

export interface CheckItem {
  id: string;
  category: ChecklistCategory;
  description: string;
  status: ComplianceStatus;
  details?: string;
  remediation?: string;
}

export interface ChecklistRequest {
  targetPath: string; // File or directory to check
  categories?: ChecklistCategory[]; // Optional categories to focus on
  requestingAgentId: AgentId;
  recursive?: boolean; // For directory paths, whether to check subdirectories
}

export interface ChecklistResponse {
  items: CheckItem[];
  summary: {
    compliant: number;
    partiallyCompliant: number;
    notCompliant: number;
    needsReview: number;
    notApplicable: number;
    overallStatus: ComplianceStatus;
  };
  targetPath: string;
}

export interface ChecklistContract {
  /**
   * Request a compliance check for a file or directory
   * @param request Details of what to check
   * @returns A promise that resolves to the checklist response
   */
  checkCompliance(
    request: ChecklistInput
  ): Promise<ContractResult<ChecklistOutput, AgentError>>;

  /**
   * Get the available checklist categories
   * @returns A promise that resolves to a list of available categories
   */
  getCategories(): Promise<ContractResult<CategoriesOutput, AgentError>>;

  /**
   * Generate a compliance report
   * @param targetPath The path to generate a report for
   * @param format The format of the report (markdown, html, etc)
   * @returns A promise that resolves to the report content
   */
  generateReport(
    targetPath: string,
    format: string
  ): Promise<ContractResult<ReportOutput, AgentError>>;
}
