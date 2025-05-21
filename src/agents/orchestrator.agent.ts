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
  AgentError,
  AgentId,
  ContractResult,
  ErrorCategory,
  TaskId,
  TaskStatus,
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

  private mapAgentErrorToError(agentError: AgentError): Error {
    const error = new Error(
      `[${agentError.agentId} | ${agentError.category} | ${agentError.name}] ${
        agentError.message
      }${
        agentError.details
          ? " Details: " + JSON.stringify(agentError.details)
          : ""
      }`
    );
    error.name = agentError.name;
    return error;
  }

  /**
   * Submit a task request to another agent
   */ async submitTask(request: TaskRequest): Promise<TaskResponse> {
    // Validate the agent is registered
    if (!this.registeredAgents.has(request.agentId)) {
      return {
        taskId: request.taskId,
        status: TaskStatus.FAILED,
        errors: [
          this.mapAgentErrorToError({
            name: "AgentNotRegisteredError",
            message: `Agent ${request.agentId} is not registered`,
            category: ErrorCategory.AGENT_UNAVAILABLE,
            agentId: request.agentId,
            details: `Agent ID ${request.agentId} not found in registered agents list.`,
          } as AgentError),
        ],
      };
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
        return {
          taskId: request.taskId,
          status: TaskStatus.FAILED,
          errors: [
            this.mapAgentErrorToError({
              name: "ActionNotSupportedError",
              message: `Action '${request.action}' not supported for agent '${request.agentId}' or agent not available.`,
              category: ErrorCategory.INVALID_REQUEST,
              agentId: request.agentId,
              details: {
                action: request.action,
                agentId: request.agentId,
                parameters: request.parameters,
              },
            } as AgentError),
          ],
          executionTime: 0,
        };
      }

      if (!agentContractResult) {
        this.tasks.set(request.taskId, {
          ...request,
          status: TaskStatus.FAILED,
        });
        return {
          taskId: request.taskId,
          status: TaskStatus.FAILED,
          errors: [
            this.mapAgentErrorToError({
              name: "UnhandledActionError",
              message: `The action '${request.action}' for agent '${request.agentId}' was not handled. Agent might be available but action is unknown or produced no result.`,
              category: ErrorCategory.INVALID_REQUEST,
              agentId: request.agentId,
              details: `Ensure the agent is configured to handle this action and the contract method was called.`,
            } as AgentError),
          ],
          executionTime: 0,
        };
      }

      if (agentContractResult.error) {
        this.tasks.set(request.taskId, {
          ...request,
          status: TaskStatus.FAILED,
        });
        return {
          taskId: request.taskId,
          status: TaskStatus.FAILED,
          errors: [this.mapAgentErrorToError(agentContractResult.error)],
          executionTime: 0, // SDD-TODO: Consider how to get execution time for failed tasks
        };
      }

      // Success case
      this.tasks.set(request.taskId, {
        ...request,
        status: TaskStatus.COMPLETED,
      });
      return {
        taskId: request.taskId,
        status: TaskStatus.COMPLETED,
        result: agentContractResult.result, // Directly use the result from ContractResult
        executionTime: 0, // SDD-TODO: Populate actual execution time, possibly from ContractResult metadata if added
      };
    } catch (error: any) {
      // Update task status to failed
      this.tasks.set(request.taskId, { ...request, status: TaskStatus.FAILED });

      const agentError: AgentError = {
        name: error.name || "TaskExecutionError",
        message: error.message || "Unknown error during task execution",
        category: ErrorCategory.UNEXPECTED_ERROR,
        agentId: request.agentId,
        details: { stack: error.stack, originalError: error.message },
      };
      return {
        taskId: request.taskId,
        status: TaskStatus.FAILED,
        errors: [this.mapAgentErrorToError(agentError)],
        executionTime: 0,
      };
    }
  }

  /**
   * Retrieve the status of a task
   */
  async getTaskStatus(taskId: TaskId): Promise<TaskStatus> {
    // ? QUESTION: Is the error handling strategy sufficient for all edge cases?
    const task = this.tasks.get(taskId);
    if (!task) {
      // SDD-TODO: Standardize error throwing, perhaps use a custom error type or AgentError directly
      // For now, let's return a specific status or throw a typed error if defined.
      // throw new Error(`Task ${taskId} not found`);
      // Consider returning a TaskResponse with FAILED status and appropriate error.
      // This method is expected to return Promise<TaskStatus>, so throwing is one option,
      // or have a specific TaskStatus like NOT_FOUND if that fits the model.
      // For now, keeping the throw as it was, but this is a point of refinement.
      throw new Error(`Task ${taskId} not found`);
    }
    return task.status;
  }

  /**
   * Register an agent with the orchestrator
   */
  async registerAgent(
    agentId: AgentId,
    capabilities: string[]
  ): Promise<boolean> {
    // ! WARNING: This agent is tightly coupled—consider refactoring
    if (this.registeredAgents.has(agentId)) {
      console.warn(
        `Agent ${agentId} is already registered. Overwriting capabilities.`
      );
      // return false; // Original behavior: Already registered
    }

    this.registeredAgents.set(agentId, capabilities);
    console.log(
      `Agent ${agentId} registered with capabilities: ${capabilities.join(
        ", "
      )}`
    );
    return true;
  }

  /**
   * Deregister an agent from the orchestrator
   */
  async deregisterAgent(agentId: AgentId): Promise<boolean> {
    // NOTE: Update contract version and notify all consumers if this behavior changes
    return this.registeredAgents.delete(agentId);
  }
}
