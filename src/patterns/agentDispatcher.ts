/**
 * PURPOSE: Dynamic agent request dispatching
 * DATA FLOW: Request → Dispatcher → Registry → Agent Method
 * INTEGRATION POINTS: AgentRegistry, Orchestrator, All Agents
 * CONTRACT VERSION: v1
 * ERROR HANDLING: Clear errors for missing agents/actions
 */

import {
  AgentId,
  ContractResult,
  createAgentError,
  ErrorCategory,
  failure,
} from "../contracts/types";
import { AgentRegistry } from "./agentRegistry";

/**
 * Request format for agent dispatch
 */
export interface DispatchRequest<TPayload = unknown> {
  /** Target agent ID */
  agentId: AgentId;

  /** Action/method to invoke on the agent */
  action: string;

  /** Payload to pass to the agent method */
  payload: TPayload;

  /** Optional requesting agent ID for error context */
  requestingAgentId?: AgentId;
}

/**
 * AgentDispatcher - Dynamic request routing and method invocation
 *
 * Eliminates the massive if-else chain in orchestrator by dynamically
 * dispatching requests to agents based on agentId and action.
 *
 * @example
 * ```typescript
 * const dispatcher = new AgentDispatcher(registry);
 *
 * const result = await dispatcher.dispatch({
 *   agentId: "knowledge-agent",
 *   action: "retrieveKnowledge",
 *   payload: { query: "SDD patterns", requestingAgentId: "orchestrator" }
 * });
 * ```
 */
export class AgentDispatcher {
  constructor(private registry: AgentRegistry) {}

  /**
   * Dispatch a request to an agent
   *
   * Looks up the agent by ID, finds the requested method, and invokes it
   * with the provided payload.
   *
   * @param request Dispatch request
   * @returns Result from the agent method
   */
  async dispatch<TResult = unknown, TPayload = unknown>(
    request: DispatchRequest<TPayload>
  ): Promise<ContractResult<TResult>> {
    // Validate request
    if (!request || !request.agentId || !request.action) {
      return failure(
        createAgentError(
          "orchestrator",
          "Dispatch request must include agentId and action",
          ErrorCategory.INVALID_REQUEST,
          "InvalidDispatchRequest",
          request?.requestingAgentId
        )
      );
    }

    // Lookup agent
    const registration = this.registry.get(request.agentId);

    if (!registration) {
      return failure(
        createAgentError(
          "orchestrator",
          `Agent '${request.agentId}' not found in registry`,
          ErrorCategory.AGENT_UNAVAILABLE,
          "AgentNotFoundError",
          request.requestingAgentId,
          {
            agentId: request.agentId,
            availableAgents: this.registry.listAll(),
          }
        )
      );
    }

    // Get method from agent instance
    const method = registration.instance[request.action];

    if (!method || typeof method !== "function") {
      return failure(
        createAgentError(
          "orchestrator",
          `Action '${request.action}' not found on agent '${request.agentId}'`,
          ErrorCategory.INVALID_REQUEST,
          "ActionNotFoundError",
          request.requestingAgentId,
          {
            agentId: request.agentId,
            action: request.action,
            availableCapabilities: registration.capabilities,
          }
        )
      );
    }

    // Invoke method
    try {
      const result = await (method as Function).call(
        registration.instance,
        request.payload
      ) as ContractResult<TResult>;
      return result;
    } catch (error: any) {
      return failure(
        createAgentError(
          "orchestrator",
          `Dispatch to ${request.agentId}.${request.action} failed: ${error.message}`,
          ErrorCategory.UNEXPECTED_ERROR,
          "DispatchError",
          request.requestingAgentId,
          {
            agentId: request.agentId,
            action: request.action,
            originalError: error.message,
            stack: error.stack,
          }
        )
      );
    }
  }

  /**
   * Check if an agent and action are available
   *
   * @param agentId Agent identifier
   * @param action Action/method name
   * @returns True if agent exists and has the action
   */
  canDispatch(agentId: AgentId, action: string): boolean {
    const registration = this.registry.get(agentId);
    if (!registration) {
      return false;
    }

    const method = registration.instance[action];
    return !!(method && typeof method === "function");
  }

  /**
   * Get all available actions for an agent
   *
   * @param agentId Agent identifier
   * @returns Array of action names or empty array if agent not found
   */
  getAvailableActions(agentId: AgentId): string[] {
    const registration = this.registry.get(agentId);
    if (!registration) {
      return [];
    }

    return registration.capabilities;
  }
}
