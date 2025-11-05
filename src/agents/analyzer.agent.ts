/**
 * Seam Analyzer Agent - AI-Powered Implementation
 *
 * Purpose: Analyzes code/docs to detect seams and integration points using AI.
 * Data Flow: Receives code/doc input, outputs seam analysis results.
 * Integration: Invoked by orchestrator; uses AIService for intelligent analysis.
 *
 * SDD: Full implementation using AI to replace heuristic-based seam detection.
 */
import {
  AnalyzerAgentContract,
  AnalyzerInput,
  AnalyzerOutput,
  SeamInfo,
} from "../contracts/analyzer.contract";
import {
  AgentId,
  ContractResult,
  createAgentError,
  ErrorCategory,
  failure,
  success,
} from "../contracts/types";
import { IAIService } from "../contracts/ai-service.contract";
import * as fs from "fs";
import * as path from "path";

const AGENT_ID: AgentId = "AnalyzerAgent";

export class AnalyzerAgent implements AnalyzerAgentContract {
  public readonly agentId: AgentId = AGENT_ID;
  private aiService?: IAIService;

  constructor(aiService?: IAIService) {
    this.aiService = aiService;
  }

  async analyzeSeams(
    request: AnalyzerInput
  ): Promise<ContractResult<AnalyzerOutput>> {
    try {
      // Validate request
      if (!request.codebasePath || !request.requestingAgentId) {
        return failure(
          createAgentError(
            this.agentId,
            "Invalid request: Missing codebasePath or requestingAgentId",
            ErrorCategory.INVALID_REQUEST,
            "InvalidSeamAnalysisRequest",
            request.requestingAgentId,
            { request }
          )
        );
      }

      // Check if AI service is available
      if (!this.aiService) {
        return failure(
          createAgentError(
            this.agentId,
            "AI service not available. AnalyzerAgent requires AI service to function.",
            ErrorCategory.AGENT_UNAVAILABLE,
            "AnalyzerAgentError",
            request.requestingAgentId
          )
        );
      }

      // Read codebase files
      const codebaseContent = await this.readCodebase(request.codebasePath);
      if (!codebaseContent || codebaseContent.trim() === "") {
        return failure(
          createAgentError(
            this.agentId,
            `Failed to read codebase at path: ${request.codebasePath}`,
            ErrorCategory.FILE_SYSTEM_ERROR,
            "CodebaseReadError",
            request.requestingAgentId,
            { path: request.codebasePath }
          )
        );
      }

      // Read documentation if provided
      let docsContent = "";
      if (request.docsPath) {
        docsContent = await this.readCodebase(request.docsPath);
      }

      // Prepare AI analysis request
      const instructions = `Analyze this codebase following Seam-Driven Development (SDD) principles to identify:

1. **Seams**: Clear boundaries/contracts between components (interfaces, APIs, integration points)
2. **Integration Points**: Where different components/modules interact
3. **Risk Assessment**: Potential issues in the identified seams
4. **Agent Identification**: Which agents/components are involved in each seam

Codebase:
\`\`\`
${codebaseContent.substring(0, 8000)}${codebaseContent.length > 8000 ? "\n... (truncated)" : ""}
\`\`\`
${docsContent ? `\n\nDocumentation:\n\`\`\`\n${docsContent.substring(0, 2000)}\n\`\`\`\n` : ""}

Provide analysis in JSON format:
{
  "seams": [
    {
      "seamId": "unique-identifier",
      "agents": ["agent1", "agent2"],
      "description": "What this seam represents",
      "status": "ACTIVE" | "DEPRECATED" | "PLANNED",
      "riskLevel": "LOW" | "MEDIUM" | "HIGH"
    }
  ],
  "issues": [
    {
      "severity": "ERROR" | "WARNING" | "INFO",
      "message": "Issue description",
      "location": "file or component",
      "suggestion": "How to fix"
    }
  ]
}`;

      const analysisResult = await this.aiService.analyze({
        content: codebaseContent,
        analysisType: "code",
        instructions,
        context: {
          codebasePath: request.codebasePath,
          docsPath: request.docsPath,
        },
      });

      if (!analysisResult.success) {
        return failure(
          createAgentError(
            this.agentId,
            `AI analysis failed: ${analysisResult.error.message}`,
            ErrorCategory.OPERATION_FAILED,
            "AnalysisError",
            request.requestingAgentId,
            { originalError: analysisResult.error }
          )
        );
      }

      // Parse AI response
      const aiResult = analysisResult.result;
      let seamAnalysis: AnalyzerOutput;

      // Try to extract structured data from details
      if (aiResult.details && typeof aiResult.details === "object") {
        seamAnalysis = {
          seams: this.parseSeams(aiResult.details.seams || []),
          issues: aiResult.details.issues || [],
        };
      } else {
        // Fallback: construct from unstructured response
        seamAnalysis = {
          seams: this.createSeamsFromInsights(aiResult.insights),
          issues: [
            {
              severity: "INFO",
              message: aiResult.summary,
              location: request.codebasePath,
            },
          ],
        };
      }

      // Add recommendations as issues
      if (aiResult.recommendations && aiResult.recommendations.length > 0) {
        aiResult.recommendations.forEach((rec) => {
          seamAnalysis.issues = seamAnalysis.issues || [];
          seamAnalysis.issues.push({
            severity: "INFO",
            message: rec,
            location: request.codebasePath,
          });
        });
      }

      return success(seamAnalysis);
    } catch (error: any) {
      return failure(
        createAgentError(
          this.agentId,
          `Analysis failed: ${error.message}`,
          ErrorCategory.UNEXPECTED_ERROR,
          "AnalyzerAgentError",
          request.requestingAgentId,
          { originalError: error }
        )
      );
    }
  }

  /**
   * Read codebase content from a path
   */
  private async readCodebase(targetPath: string): Promise<string> {
    try {
      if (!fs.existsSync(targetPath)) {
        return "";
      }

      const stats = fs.statSync(targetPath);

      if (stats.isFile()) {
        return fs.readFileSync(targetPath, "utf-8");
      } else if (stats.isDirectory()) {
        // Read multiple files from directory
        const files = fs.readdirSync(targetPath);
        let content = "";

        for (const file of files.slice(0, 10)) {
          // Limit to first 10 files
          const filePath = path.join(targetPath, file);
          const fileStats = fs.statSync(filePath);

          if (
            fileStats.isFile() &&
            (file.endsWith(".ts") ||
              file.endsWith(".js") ||
              file.endsWith(".md"))
          ) {
            const fileContent = fs.readFileSync(filePath, "utf-8");
            content += `\n\n// File: ${file}\n${fileContent.substring(0, 2000)}`;
          }
        }

        return content;
      }

      return "";
    } catch (error) {
      return "";
    }
  }

  /**
   * Parse seams from AI response
   */
  private parseSeams(seamsData: any[]): SeamInfo[] {
    if (!Array.isArray(seamsData)) {
      return [];
    }

    const parsed: SeamInfo[] = [];
    for (let idx = 0; idx < seamsData.length; idx++) {
      const seam = seamsData[idx];
      try {
        parsed.push({
          seamId: seam.seamId || `seam-${idx}`,
          agents: Array.isArray(seam.agents) ? seam.agents : [this.agentId],
          description: seam.description || "Identified seam",
          status: this.parseSeamStatus(seam.status),
          riskLevel: this.parseRiskLevel(seam.riskLevel),
        });
      } catch {
        // Skip invalid seams
      }
    }
    return parsed;
  }

  /**
   * Create seams from unstructured insights
   */
  private createSeamsFromInsights(insights: string[]): SeamInfo[] {
    return insights.map((insight, idx) => ({
      seamId: `seam-insight-${idx}`,
      agents: [this.agentId],
      description: insight,
      status: "ACTIVE" as const,
      riskLevel: "MEDIUM" as const,
    }));
  }

  /**
   * Parse seam status
   */
  private parseSeamStatus(
    status: any
  ): "ACTIVE" | "DEPRECATED" | "PLANNED" {
    const statusUpper = String(status || "").toUpperCase();
    if (["ACTIVE", "DEPRECATED", "PLANNED"].includes(statusUpper)) {
      return statusUpper as "ACTIVE" | "DEPRECATED" | "PLANNED";
    }
    return "ACTIVE";
  }

  /**
   * Parse risk level
   */
  private parseRiskLevel(level: any): "LOW" | "MEDIUM" | "HIGH" {
    const levelUpper = String(level || "").toUpperCase();
    if (["LOW", "MEDIUM", "HIGH"].includes(levelUpper)) {
      return levelUpper as "LOW" | "MEDIUM" | "HIGH";
    }
    return "MEDIUM";
  }
}
