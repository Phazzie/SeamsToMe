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
  createAgentError,
  ErrorCategory,
  failure,
  success,
} from "../contracts/types"; // Added necessary imports

/**
 * Checklist Agent - Stub Implementation
 *
 * This is an intentionally minimal implementation per SDD principles.
 * The focus is on contract conformance rather than full functionality.
 */
export class ChecklistAgent implements ChecklistContract {
  private categories: ChecklistCategory[] = Object.values(ChecklistCategory);
  public readonly agentId: AgentId = "checklist-agent" as AgentId;
  /**
   * Check compliance for a file or directory
   */
  async checkCompliance(
    request: ChecklistInput
  ): Promise<ContractResult<ChecklistOutput, AgentError>> {
    try {
      // Validate request
      if (!request || !request.targetPath) {
        return failure(
          createAgentError(
            this.agentId,
            "targetPath is required",
            ErrorCategory.INVALID_REQUEST,
            "ValidationError"
          )
        );
      }

      // * HIGHLIGHT: This implementation follows SDD minimal approach
      const categoriesToCheck = request.categories || this.categories;
      const items: CheckItem[] = [];

      // Generate check items for each category
      for (const category of categoriesToCheck) {
        const item = this.generateCheckItem(category, request.targetPath);
        items.push(item);
      }

      // Calculate summary statistics
      const summary = this.calculateSummary(items);

      return success({
        items,
        summary,
        targetPath: request.targetPath,
      });
    } catch (error: any) {
      return failure(
        createAgentError(
          this.agentId,
          error.message || "Failed to check compliance",
          ErrorCategory.OPERATION_FAILED,
          "ComplianceCheckError"
        )
      );
    }
  }
  /**
   * Get available checklist categories
   */
  async getCategories(): Promise<ContractResult<CategoriesOutput, AgentError>> {
    try {
      // ? QUESTION: Is the error handling strategy sufficient for all edge cases?
      return success([...this.categories]);
    } catch (error: any) {
      return failure(
        createAgentError(
          this.agentId,
          error.message || "Failed to retrieve categories",
          ErrorCategory.OPERATION_FAILED,
          "CategoryRetrievalError"
        )
      );
    }
  }
  /**
   * Generate a compliance report
   */
  async generateReport(
    targetPath: string,
    format: string,
    requestingAgentId?: AgentId
  ): Promise<ContractResult<ReportOutput, AgentError>> {
    try {
      // Validate request
      if (!targetPath) {
        return failure(
          createAgentError(
            this.agentId,
            "targetPath is required",
            ErrorCategory.INVALID_REQUEST,
            "ValidationError"
          )
        );
      }

      // Only support markdown format for now
      if (format.toLowerCase() !== "markdown") {
        return failure(
          createAgentError(
            this.agentId,
            `Format ${format} not supported yet`,
            ErrorCategory.INVALID_REQUEST,
            "UnsupportedFormatError"
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
    } catch (error: any) {
      return failure(
        createAgentError(
          this.agentId,
          error.message || "Failed to generate report",
          ErrorCategory.OPERATION_FAILED,
          "ReportGenerationError"
        )
      );
    }
  }

  /**
   * Generate a check item for a specific category
   * Private helper method for business logic implementation
   */
  private generateCheckItem(
    category: ChecklistCategory,
    targetPath: string
  ): CheckItem {
    // Generate unique ID
    const id = `check-${category.toLowerCase()}-${Date.now()}-${Math.floor(
      Math.random() * 1000
    )}`;

    // Simple logic to provide different compliance statuses based on category
    let status: ComplianceStatus;
    let details: string;
    let remediation: string;

    switch (category) {
      case ChecklistCategory.CONTRACT_DEFINITION:
        status = ComplianceStatus.COMPLIANT;
        details = "Contract interface found and properly structured";
        remediation = "No action required";
        break;
      case ChecklistCategory.STUB_IMPLEMENTATION:
        status = ComplianceStatus.PARTIALLY_COMPLIANT;
        details = "Basic stub implementation exists but needs enhancement";
        remediation = "Add comprehensive business logic implementation";
        break;
      case ChecklistCategory.DOCUMENTATION:
        status = ComplianceStatus.NEEDS_REVIEW;
        details = "Documentation present but may need updates";
        remediation = "Review and update documentation for completeness";
        break;
      case ChecklistCategory.TESTING:
        status = ComplianceStatus.NOT_COMPLIANT;
        details = "Missing comprehensive test coverage";
        remediation = "Create unit tests and integration tests";
        break;
      case ChecklistCategory.CODE_QUALITY:
        status = ComplianceStatus.COMPLIANT;
        details = "Code follows established patterns and standards";
        remediation = "No action required";
        break;
      case ChecklistCategory.ERROR_HANDLING:
        status = ComplianceStatus.PARTIALLY_COMPLIANT;
        details = "Basic error handling in place but could be more comprehensive";
        remediation = "Add detailed error scenarios and recovery strategies";
        break;
      default:
        status = ComplianceStatus.NOT_APPLICABLE;
        details = "Category not applicable to this target";
        remediation = "No action required";
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
