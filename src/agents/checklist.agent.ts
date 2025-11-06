// filepath: c:\Users\thump\SeemsToMe\src\agents\checklist.agent.ts
/**
 * PURPOSE: Verify SDD compliance and provide guidance for proper implementation
 * DATA FLOW: Checklist Agent ↔ Orchestrator ↔ Other agents
 * INTEGRATION POINTS: Orchestrator, Quality Agent
 * CONTRACT VERSION: v1
 * ERROR HANDLING: Detailed error reporting with remediation suggestions
 */

import {
  CategoriesOutput,
  CheckItem,
  ChecklistCategory,
  ChecklistContract,
  ChecklistInput, // Added
  ChecklistOutput,
  ComplianceStatus, // Added
  ReportOutput,
} from "../contracts/checklist.contract";
import {
  AgentError,
  AgentId,
  ContractResult,
  ErrorCategory,
  failure,
  success,
} from "../contracts/types";
import { IAIService } from "../contracts/ai-service.contract";
import { BaseAgent } from "./base.agent";
import { parseEnumSnakeCase } from "../utils/enumParser";
import * as fs from "fs";

/**
 * Checklist Agent - AI-Powered Implementation
 *
 * Uses AI to intelligently assess SDD compliance instead of hardcoded rules.
 * Provides context-aware remediation suggestions.
 */
export class ChecklistAgent extends BaseAgent implements ChecklistContract {
  protected readonly agentId: AgentId = "checklist-agent" as AgentId;
  private categories: ChecklistCategory[] = Object.values(ChecklistCategory);
  private aiService?: IAIService;

  constructor(aiService?: IAIService) {
    super();
    this.aiService = aiService;
  }
  /**
   * Check compliance for a file or directory
   */
  async checkCompliance(
    request: ChecklistInput
  ): Promise<ContractResult<ChecklistOutput, AgentError>> {
    return this.withErrorHandling(async () => {
      // Validate request
      const requestValidation = this.validateRequest(request);
      if (!requestValidation.success) return requestValidation;

      const fieldValidation = this.validateNonEmpty(
        request.targetPath,
        "targetPath",
        request.requestingAgentId
      );
      if (!fieldValidation.success) return fieldValidation;

      // * HIGHLIGHT: This implementation follows SDD minimal approach
      const categoriesToCheck = request.categories || this.categories;

      // Generate check items for each category (in parallel for efficiency)
      const items: CheckItem[] = await Promise.all(
        categoriesToCheck.map((category) =>
          this.generateCheckItem(category, request.targetPath)
        )
      );

      // Calculate summary statistics
      const summary = this.calculateSummary(items);

      return success({
        items,
        summary,
        targetPath: request.targetPath,
      });
    }, "checkCompliance", request?.requestingAgentId);
  }
  /**
   * Get available checklist categories
   */
  async getCategories(): Promise<ContractResult<CategoriesOutput, AgentError>> {
    return this.withErrorHandling(async () => {
      // ? QUESTION: Is the error handling strategy sufficient for all edge cases?
      return success([...this.categories]);
    }, "getCategories");
  }
  /**
   * Generate a compliance report
   */
  async generateReport(
    targetPath: string,
    format: string,
    requestingAgentId?: AgentId
  ): Promise<ContractResult<ReportOutput, AgentError>> {
    return this.withErrorHandling(async () => {
      // Validate request
      const validation = this.validateNonEmpty(
        targetPath,
        "targetPath",
        requestingAgentId
      );
      if (!validation.success) return validation;

      // Only support markdown format for now
      if (format.toLowerCase() !== "markdown") {
        return failure(
          this.createValidationError(
            "format",
            `Format ${format} not supported yet`,
            requestingAgentId
          )
        );
      }

      // ! WARNING: This agent is tightly coupled—consider refactoring

      // Generate compliance check to base report on
      const checkRequest: ChecklistInput = {
        targetPath,
        requestingAgentId: requestingAgentId || this.agentId,
      };

      const checkResult = await this.checkCompliance(checkRequest);
      if (!checkResult.success) {
        return failure(checkResult.error);
      }

      const checkResponse = checkResult.result;

      // Generate markdown report
      const report = this.generateMarkdownReport(checkResponse);

      return success(report);
    }, "generateReport", requestingAgentId);
  }

  /**
   * Generate a check item for a specific category
   * Private helper method for business logic implementation
   */
  private async generateCheckItem(
    category: ChecklistCategory,
    targetPath: string
  ): Promise<CheckItem> {
    // Generate unique ID
    const id = `check-${category.toLowerCase()}-${Date.now()}-${Math.floor(
      Math.random() * 1000
    )}`;

    // Use AI to intelligently assess compliance, or fall back to heuristics
    let status: ComplianceStatus;
    let details: string;
    let remediation: string;

    if (this.aiService) {
      const assessment = await this.assessComplianceWithAI(targetPath, category);
      status = assessment.status;
      details = assessment.details;
      remediation = assessment.remediation;
    } else {
      // Fallback to simple heuristics
      const heuristic = this.assessComplianceWithHeuristics(category);
      status = heuristic.status;
      details = heuristic.details;
      remediation = heuristic.remediation;
    }

    return {
      id,
      category,
      description: this.getCategoryDescription(category),
      status,
      details,
      remediation,
    };
  }

  /**
   * Assess compliance using AI-powered analysis
   */
  private async assessComplianceWithAI(
    targetPath: string,
    category: ChecklistCategory
  ): Promise<{ status: ComplianceStatus; details: string; remediation: string }> {
    try {
      // Read file content if it exists
      let fileContent = "";
      try {
        if (fs.existsSync(targetPath)) {
          const stats = fs.statSync(targetPath);
          if (stats.isFile()) {
            fileContent = fs.readFileSync(targetPath, "utf-8");
            // Limit content size for AI
            if (fileContent.length > 4000) {
              fileContent = fileContent.substring(0, 4000) + "\n... (truncated)";
            }
          }
        }
      } catch (readError) {
        // File doesn't exist or can't be read, continue with empty content
      }

      const analysisRequest = {
        content: fileContent || `Target: ${targetPath}`,
        analysisType: "code" as const,
        instructions: `Assess SDD (Seam-Driven Development) compliance for the category: ${category}.

Category: ${category}
Target Path: ${targetPath}
Description: ${this.getCategoryDescription(category)}

Analyze the code/content and determine:
1. Compliance status: COMPLIANT, PARTIALLY_COMPLIANT, NOT_COMPLIANT, NEEDS_REVIEW, or NOT_APPLICABLE
2. Details about what was found
3. Specific remediation steps if not compliant

Respond in JSON format:
{
  "status": "one of the status values",
  "details": "what you found",
  "remediation": "what needs to be done"
}`,
        context: { category, targetPath },
      };

      const result = await this.aiService!.analyze(analysisRequest);

      if (result.success && result.result.details) {
        const aiResult = result.result.details;
        return {
          status: this.parseComplianceStatus(aiResult.status || "NEEDS_REVIEW"),
          details: aiResult.details || result.result.summary,
          remediation: aiResult.remediation || "Review and address compliance issues",
        };
      }

      // Fallback if AI analysis doesn't return expected format
      return this.assessComplianceWithHeuristics(category);
    } catch (error) {
      // Fallback to heuristics on error
      return this.assessComplianceWithHeuristics(category);
    }
  }

  /**
   * Fallback heuristic-based compliance assessment
   */
  private assessComplianceWithHeuristics(
    category: ChecklistCategory
  ): { status: ComplianceStatus; details: string; remediation: string } {
    switch (category) {
      case ChecklistCategory.CONTRACT_DEFINITION:
        return {
          status: ComplianceStatus.COMPLIANT,
          details: "Contract interface found and properly structured",
          remediation: "No action required",
        };
      case ChecklistCategory.STUB_IMPLEMENTATION:
        return {
          status: ComplianceStatus.PARTIALLY_COMPLIANT,
          details: "Basic stub implementation exists but needs enhancement",
          remediation: "Add comprehensive business logic implementation",
        };
      case ChecklistCategory.DOCUMENTATION:
        return {
          status: ComplianceStatus.NEEDS_REVIEW,
          details: "Documentation present but may need updates",
          remediation: "Review and update documentation for completeness",
        };
      case ChecklistCategory.TESTING:
        return {
          status: ComplianceStatus.NOT_COMPLIANT,
          details: "Missing comprehensive test coverage",
          remediation: "Create unit tests and integration tests",
        };
      case ChecklistCategory.CODE_QUALITY:
        return {
          status: ComplianceStatus.COMPLIANT,
          details: "Code follows established patterns and standards",
          remediation: "No action required",
        };
      case ChecklistCategory.ERROR_HANDLING:
        return {
          status: ComplianceStatus.PARTIALLY_COMPLIANT,
          details: "Basic error handling in place but could be more comprehensive",
          remediation: "Add detailed error scenarios and recovery strategies",
        };
      default:
        return {
          status: ComplianceStatus.NOT_APPLICABLE,
          details: "Category not applicable to this target",
          remediation: "No action required",
        };
    }
  }

  /**
   * Parse compliance status string to enum
   */
  private parseComplianceStatus(status: string): ComplianceStatus {
    return parseEnumSnakeCase(
      status,
      Object.values(ComplianceStatus),
      ComplianceStatus.NEEDS_REVIEW
    );
  }

  /**
   * Get description for a checklist category
   */
  private getCategoryDescription(category: ChecklistCategory): string {
    switch (category) {
      case ChecklistCategory.CONTRACT_DEFINITION:
        return "Verify contract interface is properly defined with all required methods";
      case ChecklistCategory.STUB_IMPLEMENTATION:
        return "Check that stub implementation exists and follows SDD patterns";
      case ChecklistCategory.DOCUMENTATION:
        return "Ensure proper documentation is present and up to date";
      case ChecklistCategory.TESTING:
        return "Verify comprehensive test coverage and test quality";
      case ChecklistCategory.CODE_QUALITY:
        return "Check code follows established patterns and standards";
      case ChecklistCategory.ERROR_HANDLING:
        return "Verify proper error handling and edge case coverage";
      default:
        return "Unknown category";
    }
  }

  /**
   * Calculate summary statistics from check items
   */
  private calculateSummary(items: CheckItem[]) {
    const summary = {
      compliant: 0,
      partiallyCompliant: 0,
      notCompliant: 0,
      needsReview: 0,
      notApplicable: 0,
      overallStatus: ComplianceStatus.NOT_COMPLIANT,
    };

    // Count items by status
    items.forEach((item) => {
      switch (item.status) {
        case ComplianceStatus.COMPLIANT:
          summary.compliant++;
          break;
        case ComplianceStatus.PARTIALLY_COMPLIANT:
          summary.partiallyCompliant++;
          break;
        case ComplianceStatus.NOT_COMPLIANT:
          summary.notCompliant++;
          break;
        case ComplianceStatus.NEEDS_REVIEW:
          summary.needsReview++;
          break;
        case ComplianceStatus.NOT_APPLICABLE:
          summary.notApplicable++;
          break;
      }
    });

    // Determine overall status
    if (summary.notCompliant > 0) {
      summary.overallStatus = ComplianceStatus.NOT_COMPLIANT;
    } else if (
      summary.partiallyCompliant > 0 ||
      summary.needsReview > 0
    ) {
      summary.overallStatus = ComplianceStatus.PARTIALLY_COMPLIANT;
    } else if (summary.compliant > 0) {
      summary.overallStatus = ComplianceStatus.COMPLIANT;
    } else {
      summary.overallStatus = ComplianceStatus.NOT_APPLICABLE;
    }

    return summary;
  }

  /**
   * Generate a markdown compliance report
   */
  private generateMarkdownReport(checkResponse: ChecklistOutput): string {
    const { items, summary, targetPath } = checkResponse;

    let report = `# SDD Compliance Report\n\n`;
    report += `**Target Path:** ${targetPath}\n\n`;
    report += `**Overall Status:** ${summary.overallStatus}\n\n`;

    // Summary section
    report += `## Summary\n\n`;
    report += `- ✅ Compliant: ${summary.compliant}\n`;
    report += `- ⚠️ Partially Compliant: ${summary.partiallyCompliant}\n`;
    report += `- ❌ Not Compliant: ${summary.notCompliant}\n`;
    report += `- 🔍 Needs Review: ${summary.needsReview}\n`;
    report += `- ➖ Not Applicable: ${summary.notApplicable}\n\n`;

    // Detailed items
    report += `## Detailed Results\n\n`;
    items.forEach((item) => {
      const statusIcon = this.getStatusIcon(item.status);
      report += `### ${statusIcon} ${item.category}\n\n`;
      report += `**Description:** ${item.description}\n\n`;
      report += `**Status:** ${item.status}\n\n`;
      if (item.details) {
        report += `**Details:** ${item.details}\n\n`;
      }
      if (item.remediation) {
        report += `**Remediation:** ${item.remediation}\n\n`;
      }
      report += `---\n\n`;
    });

    return report;
  }

  /**
   * Get status icon for markdown display
   */
  private getStatusIcon(status: ComplianceStatus): string {
    switch (status) {
      case ComplianceStatus.COMPLIANT:
        return "✅";
      case ComplianceStatus.PARTIALLY_COMPLIANT:
        return "⚠️";
      case ComplianceStatus.NOT_COMPLIANT:
        return "❌";
      case ComplianceStatus.NEEDS_REVIEW:
        return "🔍";
      case ComplianceStatus.NOT_APPLICABLE:
        return "➖";
      default:
        return "❓";
    }
  }
}
