// filepath: c:\Users\thump\SeemsToMe\src\agents\orchestrator.agent.ts
/**
 * PURPOSE: Central coordination of the multi-agent ecosystem
 * DATA FLOW: Orchestrator ↔ All other agents
 * INTEGRATION POINTS: All agents through their respective contracts
 * CONTRACT VERSION: v1
 * ERROR HANDLING: Centralized error handling with delegation when appropriate
 */

import {
  ChangelogContract,
  ChangelogInput as GetChangesInput,
  RecordChangeInput,
} from "../contracts/changelog.contract"; // Added more specific aliases
import {
  ChecklistContract,
  ChecklistInput,
} from "../contracts/checklist.contract";
import {
  DocumentationContract,
  DocumentationInput,
  ExtractBlueprintCommentsInput,
  UpdateDocumentationInput,
  ValidateDocumentationInput,
} from "../contracts/documentation.contract"; // Added more specific aliases and DocumentationSource
import {
  OrchestratorContract,
  TaskRequest,
  TaskResponse,
} from "../contracts/orchestrator.contract";
import {
  AgentId,
  ContractResult,
  ErrorCategory,
  TaskId,
  TaskStatus,
  createAgentError,
  failure,
  success,
} from "../contracts/types";

// Imports for new agents
import {
  AnalyzerAgentContract,
  AnalyzerInput,
} from "../contracts/analyzer.contract";
import {
  ApiDocReaderAgentContract as ApiReaderAgentContract,
  ApiReaderInput,
} from "../contracts/api-reader.contract";
import {
  PairProgrammingAgentContract as PairAgentContract,
  PairInput,
} from "../contracts/pair.contract";
import { PRDAgentContract, PrdInput } from "../contracts/prd.contract";
import {
  PromptGeneratorAgentContract as PromptAgentContract,
  PromptExecutionInput,
  PromptInput,
} from "../contracts/prompt.contract";
import {
  QualityAgentContract,
  QualityInput,
} from "../contracts/quality.contract";
import {
  RefactoringAssistantAgentContract as RefactorAgentContract,
  RefactorInput,
} from "../contracts/refactor.contract";
import {
  StubAgentContract as ScaffoldAgentContract,
  ScaffoldInput,
} from "../contracts/scaffold.contract";

/**
 * Orchestrator Agent - Stub Implementation
 *
 * This is an intentionally minimal implementation per SDD principles.
 * The focus is on contract conformance rather than full functionality.
 */
export class OrchestratorAgent implements OrchestratorContract {
  private readonly registeredAgents: Map<AgentId, string[]> = new Map();
  private readonly tasks: Map<TaskId, TaskRequest & { status: TaskStatus }> =
    new Map();
  // Agent references
  private readonly checklistAgent: ChecklistContract | null = null;
  private readonly changelogAgent: ChangelogContract | null = null;
  private readonly documentationAgent: DocumentationContract | null = null;
  // New agent references
  private readonly prdAgent: PRDAgentContract | null = null;
  private readonly scaffoldAgent: ScaffoldAgentContract | null = null;
  private readonly analyzerAgent: AnalyzerAgentContract | null = null;
  private readonly qualityAgent: QualityAgentContract | null = null;
  private readonly pairAgent: PairAgentContract | null = null;
  private readonly promptAgent: PromptAgentContract | null = null;
  private readonly apiReaderAgent: ApiReaderAgentContract | null = null;
  private readonly refactorAgent: RefactorAgentContract | null = null;

  /**
   * Constructor to inject agent dependencies
   * @param agents Optional map of agents to inject
   */
  constructor(agents?: {
    checklistAgent?: ChecklistContract;
    changelogAgent?: ChangelogContract;
    documentationAgent?: DocumentationContract;
    // New agents in constructor
    prdAgent?: PRDAgentContract;
    scaffoldAgent?: ScaffoldAgentContract;
    analyzerAgent?: AnalyzerAgentContract;
    qualityAgent?: QualityAgentContract;
    pairAgent?: PairAgentContract;
    promptAgent?: PromptAgentContract;
    apiReaderAgent?: ApiReaderAgentContract;
    refactorAgent?: RefactorAgentContract;
  }) {
    if (agents) {
      this.checklistAgent = agents.checklistAgent || null;
      this.changelogAgent = agents.changelogAgent || null;
      this.documentationAgent = agents.documentationAgent || null;
      // Initialize new agents
      this.prdAgent = agents.prdAgent || null;
      this.scaffoldAgent = agents.scaffoldAgent || null;
      this.analyzerAgent = agents.analyzerAgent || null;
      this.qualityAgent = agents.qualityAgent || null;
      this.pairAgent = agents.pairAgent || null;
      this.promptAgent = agents.promptAgent || null;
      this.apiReaderAgent = agents.apiReaderAgent || null;
      this.refactorAgent = agents.refactorAgent || null;
    }
  }

  /**
   * Submit a task request to another agent
   */
  async submitTask(
    request: TaskRequest
  ): Promise<ContractResult<TaskResponse>> {
    // Validate the agent is registered
    if (!this.registeredAgents.has(request.agentId)) {
      return failure(
        createAgentError(
          request.agentId,
          `Agent ${request.agentId} is not registered`,
          ErrorCategory.AGENT_UNAVAILABLE,
          "AgentNotRegisteredError",
          undefined,
          `Agent ID ${request.agentId} not found in registered agents list.`
        )
      );
    }

    // Record the task
    this.tasks.set(request.taskId, {
      ...request,
      status: TaskStatus.PROCESSING,
    });

    try {
      let agentContractResult: ContractResult<any> | null = null;
      // let taskResultPayload: any = null; // Not needed if we directly use agentContractResult.result

      // Handle special agent types
      if (request.agentId === "checklist-agent" && this.checklistAgent) {
        if (request.action === "checkCompliance") {
          agentContractResult = await this.checklistAgent.checkCompliance(
            request.parameters as ChecklistInput
          );
        } else if (request.action === "getCategories") {
          agentContractResult = await this.checklistAgent.getCategories();
        } else if (request.action === "generateReport") {
          const params = request.parameters as {
            targetPath: string;
            format: string;
          };
          agentContractResult = await this.checklistAgent.generateReport(
            params.targetPath,
            params.format
          );
        }
      } else if (request.agentId === "changelog-agent" && this.changelogAgent) {
        if (request.action === "recordChange") {
          agentContractResult = await this.changelogAgent.recordChange(
            request.parameters as RecordChangeInput
          );
        } else if (request.action === "getChanges") {
          agentContractResult = await this.changelogAgent.getChanges(
            request.parameters as GetChangesInput
          );
        } else if (request.action === "generateChangelog") {
          const params = request.parameters as {
            request: GetChangesInput;
            format: string;
          };
          agentContractResult = await this.changelogAgent.generateChangelog(
            params.request,
            params.format
          );
        } else if (request.action === "getBreakingChanges") {
          const params = request.parameters as { since?: Date };
          agentContractResult = await this.changelogAgent.getBreakingChanges(
            params.since
          );
        }
      } else if (
        request.agentId === "documentation-agent" &&
        this.documentationAgent
      ) {
        if (request.action === "generateDocumentation") {
          agentContractResult =
            await this.documentationAgent.generateDocumentation(
              request.parameters as DocumentationInput
            );
        } else if (request.action === "validateDocumentation") {
          const params = request.parameters as ValidateDocumentationInput;
          agentContractResult =
            await this.documentationAgent.validateDocumentation(
              params.docPath,
              params.sources
            );
        } else if (request.action === "extractBlueprintComments") {
          const params = request.parameters as ExtractBlueprintCommentsInput;
          agentContractResult =
            await this.documentationAgent.extractBlueprintComments(
              params.sourcePaths
            );
        } else if (request.action === "updateDocumentation") {
          const params = request.parameters as UpdateDocumentationInput;
          agentContractResult =
            await this.documentationAgent.updateDocumentation(
              params.docPath,
              params.sources,
              params.preserveSections
            );
        }
      }
      // New Agent Delegations
      else if (request.agentId === "prd-agent" && this.prdAgent) {
        if (request.action === "generatePRD") {
          agentContractResult = await this.prdAgent.generatePRD(
            request.parameters as PrdInput
          );
        } else if (request.action === "validatePRD") {
          const params = request.parameters as { prdContent: string };
          agentContractResult = await this.prdAgent.validatePRD(
            params.prdContent
          );
        }
      } else if (request.agentId === "scaffold-agent" && this.scaffoldAgent) {
        if (request.action === "generateScaffold") {
          agentContractResult = await this.scaffoldAgent.generateScaffold(
            request.parameters as ScaffoldInput
          );
        } else if (request.action === "validateStubs") {
          const params =
            request.parameters as import("../contracts/scaffold.contract").ValidateStubsInput;
          agentContractResult = await this.scaffoldAgent.validateStubs(params);
        }
      } else if (request.agentId === "analyzer-agent" && this.analyzerAgent) {
        if (request.action === "analyzeSeams") {
          agentContractResult = await this.analyzerAgent.analyzeSeams(
            request.parameters as AnalyzerInput
          );
        }
      } else if (request.agentId === "quality-agent" && this.qualityAgent) {
        if (request.action === "checkQuality") {
          agentContractResult = await this.qualityAgent.checkQuality(
            request.parameters as QualityInput
          );
        }
      } else if (request.agentId === "pair-agent" && this.pairAgent) {
        if (request.action === "generateCode") {
          agentContractResult = await this.pairAgent.generateCode(
            request.parameters as PairInput
          );
        }
      } else if (request.agentId === "prompt-agent" && this.promptAgent) {
        if (request.action === "generatePrompt") {
          agentContractResult = await this.promptAgent.generatePrompt(
            request.parameters as PromptInput
          );
        } else if (request.action === "executePrompt") {
          agentContractResult = await this.promptAgent.executePrompt(
            request.parameters as PromptExecutionInput
          );
        }
      } else if (
        request.agentId === "api-reader-agent" &&
        this.apiReaderAgent
      ) {
        if (request.action === "readApiDoc") {
          agentContractResult = await this.apiReaderAgent.readApiDoc(
            request.parameters as ApiReaderInput
          );
        }
      } else if (request.agentId === "refactor-agent" && this.refactorAgent) {
        if (request.action === "refactor") {
          agentContractResult = await this.refactorAgent.refactor(
            request.parameters as RefactorInput
          );
        }
      } else {
        // Agent/Action not handled by specific logic above
        this.tasks.set(request.taskId, {
          ...request,
          status: TaskStatus.FAILED,
        });
        return failure(
          createAgentError(
            request.agentId,
            `Action '${request.action}' not supported for agent '${request.agentId}' or agent not available.`,
            ErrorCategory.INVALID_REQUEST,
            "ActionNotSupportedError",
            undefined,
            {
              action: request.action,
              agentId: request.agentId,
              parameters: request.parameters,
            }
          )
        );
      }
      if (!agentContractResult) {
        this.tasks.set(request.taskId, {
          ...request,
          status: TaskStatus.FAILED,
        });
        return failure(
          createAgentError(
            request.agentId,
            `The action '${request.action}' for agent '${request.agentId}' was not handled. Agent might be available but action is unknown or produced no result.`,
            ErrorCategory.INVALID_REQUEST,
            "UnhandledActionError",
            undefined,
            `Ensure the agent is configured to handle this action and the contract method was called.`
          )
        );
      }

      if (agentContractResult.error) {
        this.tasks.set(request.taskId, {
          ...request,
          status: TaskStatus.FAILED,
        });
        return failure(agentContractResult.error);
      }

      // Success case
      this.tasks.set(request.taskId, {
        ...request,
        status: TaskStatus.COMPLETED,
      });
      return success({
        taskId: request.taskId,
        status: TaskStatus.COMPLETED,
        result: agentContractResult.result,
        executionTime: 0, // SDD-TODO: Populate actual execution time
      });
    } catch (error: any) {
      // Update task status to failed
      this.tasks.set(request.taskId, { ...request, status: TaskStatus.FAILED });

      return failure(
        createAgentError(
          request.agentId,
          error.message || "Unknown error during task execution",
          ErrorCategory.UNEXPECTED_ERROR,
          error.name || "TaskExecutionError",
          undefined,
          { stack: error.stack, originalError: error.message }
        )
      );
    }
  }

  /**
   * Retrieve the status of a task
   */ async getTaskStatus(taskId: TaskId): Promise<ContractResult<TaskStatus>> {
    const task = this.tasks.get(taskId);
    if (!task) {
      return failure(
        createAgentError(
          "orchestrator-agent",
          `Task ${taskId} not found`,
          ErrorCategory.INVALID_REQUEST,
          "TaskNotFoundError"
        )
      );
    }
    return success(task.status);
  }
  /**
   * Register an agent with the orchestrator
   */
  async registerAgent(
    agentId: AgentId,
    capabilities: string[]
  ): Promise<ContractResult<boolean>> {
    if (this.registeredAgents.has(agentId)) {
      console.warn(
        `Agent ${agentId} is already registered. Overwriting capabilities.`
      );
    }

    this.registeredAgents.set(agentId, capabilities);
    console.log(
      `Agent ${agentId} registered with capabilities: ${capabilities.join(
        ", "
      )}`
    );
    return success(true);
  }
  /**
   * Deregister an agent from the orchestrator
   */
  async deregisterAgent(agentId: AgentId): Promise<ContractResult<boolean>> {
    const wasDeleted = this.registeredAgents.delete(agentId);
    return success(wasDeleted);
  }
}
