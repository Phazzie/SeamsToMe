// filepath: c:\Users\thump\SeemsToMe\src\contracts\orchestrator.contract.ts
/**
 * PURPOSE: Define the core orchestration interface for the multi-agent ecosystem
 * DATA FLOW: Orchestrator ↔ Other agents
 * INTEGRATION POINTS: All other agents in the system
 * CONTRACT VERSION: v1
 * ERROR HANDLING: Errors are centralized and handled by the orchestrator
 */

import {
  AgentError,
  AgentId,
  ContractResult,
  TaskId,
  TaskPriority,
  TaskStatus,
} from "./types";

export interface TaskRequest {
  taskId: TaskId;
  agentId: AgentId;
  action: string;
  parameters: Record<string, any>;
  priority: TaskPriority;
  deadline?: Date;
}

export interface TaskResponse {
  taskId: TaskId;
  status: TaskStatus;
  result?: any;
  errors?: AgentError[];
  executionTime?: number;
}

export interface OrchestratorContract {
  /**
   * Submit a task request to another agent
   * @param request The task to be executed
   * @returns A promise that resolves to the task response
   * @example
   * const result = await orchestrator.submitTask(taskRequest);
   * if (result.success) {
   *   console.log('Task completed:', result.result);
   * } else {
   *   console.error('Task failed:', result.error);
   * }
   */
  submitTask(request: TaskRequest): Promise<ContractResult<TaskResponse>>;

  /**
   * Retrieve the status of a task
   * @param taskId The ID of the task to check
   * @returns A promise that resolves to the task status
   * @example
   * const result = await orchestrator.getTaskStatus('task-123');
   * if (result.success) {
   *   console.log('Task status:', result.result);
   * }
   */
  getTaskStatus(taskId: TaskId): Promise<ContractResult<TaskStatus>>;

  /**
   * Register an agent with the orchestrator
   * @param agentId The ID of the agent
   * @param capabilities The capabilities of the agent
   * @returns A promise that resolves to true if registration is successful
   * @example
   * const result = await orchestrator.registerAgent('agent-1', ['analyze', 'refactor']);
   * if (result.success && result.result) {
   *   console.log('Agent registered successfully');
   * }
   */
  registerAgent(
    agentId: AgentId,
    capabilities: string[]
  ): Promise<ContractResult<boolean>>;

  /**
   * Deregister an agent from the orchestrator
   * @param agentId The ID of the agent
   * @returns A promise that resolves to true if deregistration is successful
   * @example
   * const result = await orchestrator.deregisterAgent('agent-1');
   * if (result.success && result.result) {
   *   console.log('Agent deregistered successfully');
   * }
   */
  deregisterAgent(agentId: AgentId): Promise<ContractResult<boolean>>;
}
