// filepath: c:\Users\thump\SeemsToMe\src\agents\changelog.agent.ts
/**
 * PURPOSE: Track and document changes across the system
 * DATA FLOW: Changelog Agent ↔ Orchestrator ↔ Other agents
 * INTEGRATION POINTS: Orchestrator, Documentation Agent
 * CONTRACT VERSION: v1
 * ERROR HANDLING: Contextual error reporting with specific error types
 */

import {
  ChangeImpact,
  ChangelogContract,
  ChangelogInput,
  ChangelogOutput,
  ChangeRecord,
  RecordChangeInput,
  TurnoverMessageRequest,
} from "../contracts/changelog.contract";
import {
  ContractResult,
  createAgentError,
  ErrorCategory,
  failure,
  success,
} from "../contracts/types";

/**
 * Changelog Agent - Stub Implementation
 *
 * This is an intentionally minimal implementation per SDD principles.
 * The focus is on contract conformance rather than full functionality.
 */
export class ChangelogAgent implements ChangelogContract {
  private changes: Map<string, ChangeRecord> = new Map();
  /**
   * Record a new change in the system
   */
  async recordChange(
    request: RecordChangeInput
  ): Promise<ContractResult<string>> {
    try {
      // Generate a unique ID for the change
      const changeId = `change-${Date.now()}-${Math.floor(
        Math.random() * 1000
      )}`;

      // * HIGHLIGHT: This stub is intentionally minimal per SDD
      const changeRecord: ChangeRecord = {
        id: changeId,
        timestamp: new Date(),
        ...request,
      };

      this.changes.set(changeId, changeRecord);
      return success(changeId);
    } catch (error: any) {
      return failure(
        createAgentError(
          "changelog-agent",
          error.message || "Failed to record change",
          ErrorCategory.OPERATION_FAILED,
          "RecordChangeError"
        )
      );
    }
  }
  /**
   * Get changes matching the specified criteria
   */
  async getChanges(
    request: ChangelogInput
  ): Promise<ContractResult<ChangelogOutput>> {
    try {
      // Filter changes based on request parameters
      let filteredChanges = Array.from(this.changes.values());

      // Apply filters based on request parameters
      if (request.since) {
        filteredChanges = filteredChanges.filter(
          (c) => c.timestamp >= request.since!
        );
      }

      if (request.until) {
        filteredChanges = filteredChanges.filter(
          (c) => c.timestamp <= request.until!
        );
      }

      if (request.types && request.types.length > 0) {
        filteredChanges = filteredChanges.filter((c) =>
          request.types!.includes(c.type)
        );
      }

      if (request.impactLevel) {
        // Filter by impact level or higher
        const impactLevels = Object.values(ChangeImpact);
        const minImpactIndex = impactLevels.indexOf(request.impactLevel);
        filteredChanges = filteredChanges.filter((c) => {
          const changeImpactIndex = impactLevels.indexOf(c.impact);
          return changeImpactIndex >= minImpactIndex;
        });
      }

      if (request.agentId) {
        filteredChanges = filteredChanges.filter(
          (c) => c.agentId === request.agentId
        );
      }

      if (request.contract) {
        filteredChanges = filteredChanges.filter(
          (c) =>
            c.relatedContracts && c.relatedContracts.includes(request.contract!)
        );
      }

      if (request.includeBreakingOnly) {
        filteredChanges = filteredChanges.filter((c) => c.breaking);
      }

      return success({
        changes: filteredChanges,
        totalChanges: filteredChanges.length,
        breakingChanges: filteredChanges.filter((c) => c.breaking).length,
      });
    } catch (error: any) {
      return failure(
        createAgentError(
          "changelog-agent",
          error.message || "Failed to get changes",
          ErrorCategory.OPERATION_FAILED,
          "GetChangesError"
        )
      );
    }
  }
  /**
   * Generate a formatted changelog
   */
  async generateChangelog(
    request: ChangelogInput,
    format: string
  ): Promise<ContractResult<string>> {
    try {
      // ! WARNING: This agent is tightly coupled—consider refactoring

      // Get filtered changes
      const changesResult = await this.getChanges(request);
      if (!changesResult.success) {
        return failure(changesResult.error);
      }

      // Stub implementation for markdown format
      if (format.toLowerCase() !== "markdown") {
        return failure(
          createAgentError(
            "changelog-agent",
            `Format ${format} not supported yet`,
            ErrorCategory.VALIDATION_ERROR,
            "UnsupportedFormatError"
          )
        );
      }

      let changelog = `# Changelog\n\n`;
      changelog += `Generated: ${new Date().toISOString()}\n\n`;

      // Group by change type
      const changesByType: Record<string, ChangeRecord[]> = {};

      changesResult.result.changes.forEach((change) => {
        if (!changesByType[change.type]) {
          changesByType[change.type] = [];
        }
        changesByType[change.type].push(change);
      });

      // Generate markdown for each type
      Object.entries(changesByType).forEach(([type, changes]) => {
        changelog += `## ${type}\n\n`;

        changes.forEach((change) => {
          const breakingTag = change.breaking ? " **[BREAKING]**" : "";
          changelog += `- ${change.description}${breakingTag}\n`;

          if (change.files.length > 0) {
            changelog += `  - Files: ${change.files.join(", ")}\n`;
          }

          if (change.breaking && change.migrationGuidance) {
            changelog += `  - Migration: ${change.migrationGuidance}\n`;
          }

          changelog += "\n";
        });
      });

      // NOTE: Update contract version and notify all consumers when full implementation is ready
      return success(changelog);
    } catch (error: any) {
      return failure(
        createAgentError(
          "changelog-agent",
          error.message || "Failed to generate changelog",
          ErrorCategory.OPERATION_FAILED,
          "GenerateChangelogError"
        )
      );
    }
  }
  /**
   * Get breaking changes that require migration
   */
  async getBreakingChanges(
    since?: Date
  ): Promise<ContractResult<ChangeRecord[]>> {
    try {
      const request: ChangelogInput = {
        since,
        includeBreakingOnly: true,
      };

      const changesResult = await this.getChanges(request);
      if (!changesResult.success) {
        return failure(changesResult.error);
      }

      return success(changesResult.result.changes);
    } catch (error: any) {
      return failure(
        createAgentError(
          "changelog-agent",
          error.message || "Failed to get breaking changes",
          ErrorCategory.OPERATION_FAILED,
          "GetBreakingChangesError"
        )
      );
    }
  }

  /**
   * Generate a comprehensive turnover message for project handoff
   */
  async generateTurnoverMessage(
    request: TurnoverMessageRequest
  ): Promise<ContractResult<string>> {
    try {
      const projectName = request.projectName || "SeemsToMe";
      const timeRange = request.timeRange || {
        since: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      }; // Last 7 days
      const format = request.format || "markdown";

      // Get recent changes for context
      const changesResult = await this.getChanges({
        since: timeRange.since,
        until: timeRange.until,
      });

      if (!changesResult.success) {
        return failure(changesResult.error);
      }

      const changes = changesResult.result.changes;
      const currentDate = new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });

      let turnoverMessage = "";

      if (format === "markdown") {
        turnoverMessage = this.generateMarkdownTurnover(
          projectName,
          currentDate,
          changes,
          request
        );
      } else {
        turnoverMessage = this.generateTextTurnover(
          projectName,
          currentDate,
          changes,
          request
        );
      }

      return success(turnoverMessage);
    } catch (error: any) {
      return failure(
        createAgentError(
          "changelog-agent",
          error.message || "Failed to generate turnover message",
          ErrorCategory.OPERATION_FAILED,
          "GenerateTurnoverError"
        )
      );
    }
  }

  /**
   * Generate markdown format turnover message
   */
  private generateMarkdownTurnover(
    projectName: string,
    currentDate: string,
    changes: ChangeRecord[],
    request: TurnoverMessageRequest
  ): string {
    let message = `# 🚀 ${projectName} Project Turnover - ${currentDate}\n\n`;

    // Mission Status
    const completedChanges = changes.filter(
      (c) => c.type === "FEATURE" || c.type === "BUGFIX"
    );
    const breakingChanges = changes.filter((c) => c.breaking);

    message += `## ✅ MISSION STATUS\n\n`;
    message += `**Recent Activity**: ${changes.length} changes recorded in analysis period\n`;
    message += `**Features/Fixes**: ${completedChanges.length} completed\n`;
    message += `**Breaking Changes**: ${breakingChanges.length} requiring attention\n\n`;

    // Recent Accomplishments
    if (changes.length > 0) {
      message += `## 🏆 RECENT ACCOMPLISHMENTS\n\n`;

      const changesByType = this.groupChangesByType(changes);
      Object.entries(changesByType).forEach(([type, typeChanges]) => {
        message += `### **${type.replace("_", " ")} Changes**:\n`;
        typeChanges.slice(0, 5).forEach((change) => {
          // Limit to 5 most recent
          const breakingTag = change.breaking ? " **[BREAKING]**" : "";
          message += `- ${change.description}${breakingTag}\n`;
          if (change.files.length > 0) {
            message += `  - Files: \`${change.files.slice(0, 3).join("`, `")}\`\n`;
          }
        });
        message += "\n";
      });
    }

    // Validation Commands
    if (request.includeValidationCommands !== false) {
      message += `## 🎯 IMMEDIATE VERIFICATION\n\n`;
      message += "```bash\n";
      message += `# Verify project state\n`;
      message += `npx tsc --noEmit  # Check compilation\n`;
      message += `git status        # Check working directory\n`;
      message += `git log --oneline -5  # Recent commits\n`;
      message += "```\n\n";
    }

    // Breaking Changes & Migration
    if (breakingChanges.length > 0) {
      message += `## ⚠️ BREAKING CHANGES REQUIRING ATTENTION\n\n`;
      breakingChanges.forEach((change) => {
        message += `### ${change.description}\n`;
        message += `- **Impact**: ${change.impact}\n`;
        message += `- **Files**: ${change.files.join(", ")}\n`;
        if (change.migrationGuidance) {
          message += `- **Migration**: ${change.migrationGuidance}\n`;
        }
        message += "\n";
      });
    }

    // Next Steps
    if (request.includeNextSteps !== false) {
      message += `## 🎯 IMMEDIATE NEXT ACTIONS\n\n`;
      message += `### **1. Validate Current State**\n`;
      message += `- Run verification commands above\n`;
      message += `- Ensure all tests pass\n`;
      message += `- Check for compilation errors\n\n`;

      message += `### **2. Review Recent Changes**\n`;
      message += `- Understand the ${changes.length} recent modifications\n`;
      message += `- Pay attention to breaking changes\n`;
      message += `- Review migration guidance if applicable\n\n`;

      message += `### **3. Plan Forward Progress**\n`;
      message += `- Identify next development priorities\n`;
      message += `- Consider impact of breaking changes\n`;
      message += `- Update documentation as needed\n\n`;
    }

    // Project Health
    const highImpactChanges = changes.filter(
      (c) => c.impact === "MAJOR" || c.impact === "BREAKING"
    );

    message += `## 📊 PROJECT HEALTH INDICATORS\n\n`;
    message += `- **Change Velocity**: ${changes.length} changes in analysis period\n`;
    message += `- **High Impact Changes**: ${highImpactChanges.length}\n`;
    message += `- **Contract Changes**: ${changes.filter(
      (c) => c.type === "CONTRACT_CHANGE"
    ).length}\n`;
    message += `- **Documentation Updates**: ${changes.filter(
      (c) => c.type === "DOCUMENTATION"
    ).length}\n\n`;

    message += `---\n\n`;
    message += `*Generated by ChangelogAgent on ${currentDate}*\n`;
    message += `*Analysis Period: ${changes.length} changes*\n`;

    return message;
  }

  /**
   * Generate text format turnover message
   */
  private generateTextTurnover(
    projectName: string,
    currentDate: string,
    changes: ChangeRecord[],
    request: TurnoverMessageRequest
  ): string {
    let message = `${projectName} Project Turnover - ${currentDate}\n`;
    message += "=".repeat(50) + "\n\n";

    message += `MISSION STATUS:\n`;
    message += `- Total Changes: ${changes.length}\n`;
    message += `- Breaking Changes: ${changes.filter((c) => c.breaking).length}\n\n`;

    if (changes.length > 0) {
      message += `RECENT ACCOMPLISHMENTS:\n`;
      changes.slice(0, 10).forEach((change, index) => {
        message += `${index + 1}. ${change.description}`;
        if (change.breaking) message += " [BREAKING]";
        message += "\n";
      });
      message += "\n";
    }

    if (request.includeValidationCommands !== false) {
      message += `VERIFICATION COMMANDS:\n`;
      message += `- npx tsc --noEmit\n`;
      message += `- git status\n`;
      message += `- git log --oneline -5\n\n`;
    }

    message += `Generated by ChangelogAgent on ${currentDate}\n`;

    return message;
  }

  /**
   * Group changes by type for better organization
   */
  private groupChangesByType(
    changes: ChangeRecord[]
  ): Record<string, ChangeRecord[]> {
    const grouped: Record<string, ChangeRecord[]> = {};

    changes.forEach((change) => {
      if (!grouped[change.type]) {
        grouped[change.type] = [];
      }
      grouped[change.type].push(change);
    });

    // Sort each group by timestamp (most recent first)
    Object.keys(grouped).forEach((type) => {
      grouped[type].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    });

    return grouped;
  }
}
