/**
 * Refactoring Assistant Agent - AI-Powered Implementation
 *
 * Purpose: Suggests and plans code refactoring using AI analysis.
 * Data Flow: Receives code/seam map input, outputs refactoring plans.
 * Integration: Invoked by orchestrator; uses AIService for intelligent refactoring.
 *
 * SDD: Full implementation using AI to replace heuristic-based refactoring detection.
 */
import {
  RefactoringAssistantAgentContract as IRefactorAgent,
  RefactorInput,
  RefactorOutput,
} from "../contracts/refactor.contract";
import {
  ContractResult,
  ErrorCategory,
  failure,
  success,
} from "../contracts/types";
import { IAIService } from "../contracts/ai-service.contract";
import { BaseAgent } from "./base.agent";

export class RefactorAgent extends BaseAgent implements IRefactorAgent {
  protected readonly agentId = "RefactorAgent" as const;
  private aiService?: IAIService;

  constructor(aiService?: IAIService) {
    super();
    this.aiService = aiService;
  }

  async refactor(
    request: RefactorInput
  ): Promise<ContractResult<RefactorOutput>> {
    return this.withErrorHandling(async () => {
      // Validate request
      const agentId = request?.requestingAgentId;
      if (!this.validateRequest(request, agentId)) {
        return failure(
          this.createValidationError("request", "Request is required", agentId)
        );
      }

      // Validate fields
      const fieldsValidation = this.validateFields({
        code: { value: request.code, type: "nonEmpty" }
      }, request.requestingAgentId);
      if (!fieldsValidation.success) return fieldsValidation;

      // Use AI service if available
      if (!this.aiService) {
        return failure(
          this.createError(
            "AI service not available. RefactorAgent requires AI service to function.",
            ErrorCategory.AGENT_UNAVAILABLE,
            "RefactorAgentError",
            request.requestingAgentId
          )
        );
      }

      // Prepare analysis request for AI
      const goalsText = request.goals
        ? `\n\nSpecific refactoring goals:\n${request.goals.map((g) => `- ${g}`).join("\n")}`
        : "";

      const seamMapText = request.seamMap
        ? `\n\nSeam Map / Architecture Context:\n${request.seamMap}`
        : "";

      const instructions = `Analyze this code and provide a detailed refactoring plan following SDD (Seam-Driven Development) principles.${goalsText}${seamMapText}

Code to analyze:
\`\`\`
${request.code}
\`\`\`

Provide a refactoring plan in the following JSON format:
{
  "summary": "Brief overview of recommended refactorings",
  "steps": [
    {
      "description": "Description of this refactoring step",
      "before": "Code snippet before refactoring",
      "after": "Code snippet after refactoring"
    }
  ],
  "transformedCode": "Complete refactored code (if applicable)"
}

Focus on:
1. Extracting methods/functions for better modularity
2. Improving naming and clarity
3. Reducing complexity
4. Following SDD seam patterns (clear contracts/interfaces)
5. Enhancing testability`;

      const analysisResult = await this.aiService.analyze({
        content: request.code,
        analysisType: "code",
        instructions,
        context: {
          goals: request.goals,
          seamMap: request.seamMap,
        },
      });

      if (!analysisResult.success) {
        return failure(
          this.createOperationError(
            "AI analysis",
            new Error(analysisResult.error.message),
            request.requestingAgentId
          )
        );
      }

      // Parse AI response
      const aiResult = analysisResult.result;
      let refactorPlan: RefactorOutput;

      // Try to extract structured data from details
      if (aiResult.details && typeof aiResult.details === "object") {
        refactorPlan = {
          summary:
            aiResult.details.summary ||
            aiResult.summary ||
            "Refactoring plan generated",
          steps: aiResult.details.steps || [],
          transformedCode: aiResult.details.transformedCode,
        };
      } else {
        // Fallback: construct from unstructured response
        refactorPlan = {
          summary: aiResult.summary,
          steps: aiResult.recommendations.map((rec) => ({
            description: rec,
            before: "",
            after: "",
          })),
          transformedCode: undefined,
        };
      }

      // Ensure we have at least some steps
      if (!refactorPlan.steps || refactorPlan.steps.length === 0) {
        refactorPlan.steps = aiResult.insights.map((insight) => ({
          description: insight,
          before: "",
          after: "",
        }));
      }

      return success(refactorPlan);
    }, "refactor", request?.requestingAgentId);
  }
}
