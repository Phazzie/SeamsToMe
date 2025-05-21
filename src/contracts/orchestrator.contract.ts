// filepath: c:\Users\thump\SeemsToMe\src\contracts\orchestrator.contract.ts
/**
 * PURPOSE: Define the core orchestration interface for the multi-agent ecosystem
 * DATA FLOW: Orchestrator ↔ Other agents
 * INTEGRATION POINTS: All other agents in the system
 * CONTRACT VERSION: v1
 * ERROR HANDLING: Errors are centralized and handled by the orchestrator
 */

import { AgentId, TaskId, TaskStatus, TaskPriority } from './types';

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
  errors?: Error[];
  executionTime?: number;
}

export interface OrchestratorContract {
  /**
   * Submit a task request to another agent
   * @param request The task to be executed
   * @returns A promise that resolves to the task response
   */
  submitTask(request: TaskRequest): Promise<TaskResponse>;
  
  /**
   * Retrieve the status of a task
   * @param taskId The ID of the task to check
   * @returns A promise that resolves to the task status
   */
  getTaskStatus(taskId: TaskId): Promise<TaskStatus>;
  
  /**
   * Register an agent with the orchestrator
   * @param agentId The ID of the agent
   * @param capabilities The capabilities of the agent
   * @returns A promise that resolves to true if registration is successful
   */
  registerAgent(agentId: AgentId, capabilities: string[]): Promise<boolean>;
  
  /**
   * Deregister an agent from the orchestrator
   * @param agentId The ID of the agent
   * @returns A promise that resolves to true if deregistration is successful
   */
  deregisterAgent(agentId: AgentId): Promise<boolean>;
}
