/**
 * PURPOSE: Dynamic agent registration and discovery system
 * DATA FLOW: Orchestrator → Registry → Agent instances
 * INTEGRATION POINTS: All agents, Orchestrator
 * CONTRACT VERSION: v1
 * ERROR HANDLING: Provides clear errors for missing agents or capabilities
 */

import { AgentId } from "../contracts/types";

/**
 * Agent registration metadata
 */
export interface AgentRegistration {
  /** Unique agent identifier */
  agentId: AgentId;

  /** Agent instance implementing its contract */
  instance: any;

  /** Capabilities/actions this agent supports */
  capabilities: string[];

  /** Optional priority for capability-based lookup (higher = preferred) */
  priority?: number;

  /** Optional description */
  description?: string;
}

/**
 * AgentRegistry - Dynamic agent registration and discovery
 *
 * Eliminates hardcoded agent dependencies in orchestrator.
 * Enables adding new agents without modifying orchestrator code.
 *
 * @example
 * ```typescript
 * const registry = new AgentRegistry();
 *
 * // Register agents
 * registry.register({
 *   agentId: "knowledge-agent",
 *   instance: knowledgeAgent,
 *   capabilities: ["retrieveKnowledge", "storeKnowledge"],
 *   priority: 10
 * });
 *
 * // Lookup by ID
 * const agent = registry.get("knowledge-agent");
 *
 * // Lookup by capability
 * const agents = registry.getByCapability("retrieveKnowledge");
 * ```
 */
export class AgentRegistry {
  private agents = new Map<AgentId, AgentRegistration>();
  private capabilityIndex = new Map<string, AgentId[]>();

  /**
   * Register an agent with the registry
   *
   * @param registration Agent registration metadata
   * @throws Error if agent with same ID already registered
   */
  register(registration: AgentRegistration): void {
    if (this.agents.has(registration.agentId)) {
      throw new Error(
        `Agent with ID '${registration.agentId}' is already registered`
      );
    }

    // Register agent
    this.agents.set(registration.agentId, registration);

    // Index by capabilities
    for (const capability of registration.capabilities) {
      const agents = this.capabilityIndex.get(capability) || [];
      agents.push(registration.agentId);
      this.capabilityIndex.set(capability, agents);
    }
  }

  /**
   * Get agent by ID
   *
   * @param agentId Agent identifier
   * @returns Agent registration or undefined if not found
   */
  get(agentId: AgentId): AgentRegistration | undefined {
    return this.agents.get(agentId);
  }

  /**
   * Get all agents that support a capability
   * Returns agents sorted by priority (highest first)
   *
   * @param capability Capability/action name
   * @returns Array of agent registrations supporting this capability
   */
  getByCapability(capability: string): AgentRegistration[] {
    const agentIds = this.capabilityIndex.get(capability) || [];

    return agentIds
      .map((id) => this.agents.get(id)!)
      .filter((reg) => reg !== undefined)
      .sort((a, b) => (b.priority || 0) - (a.priority || 0));
  }

  /**
   * List all registered agent IDs
   *
   * @returns Array of all agent IDs
   */
  listAll(): AgentId[] {
    return Array.from(this.agents.keys());
  }

  /**
   * Get all registered agents with their metadata
   *
   * @returns Array of all agent registrations
   */
  getAllRegistrations(): AgentRegistration[] {
    return Array.from(this.agents.values());
  }

  /**
   * Check if an agent is registered
   *
   * @param agentId Agent identifier
   * @returns True if agent is registered
   */
  has(agentId: AgentId): boolean {
    return this.agents.has(agentId);
  }

  /**
   * Unregister an agent (useful for testing)
   *
   * @param agentId Agent identifier
   * @returns True if agent was removed
   */
  unregister(agentId: AgentId): boolean {
    const registration = this.agents.get(agentId);
    if (!registration) {
      return false;
    }

    // Remove from capability index
    for (const capability of registration.capabilities) {
      const agents = this.capabilityIndex.get(capability) || [];
      const filtered = agents.filter((id) => id !== agentId);

      if (filtered.length === 0) {
        this.capabilityIndex.delete(capability);
      } else {
        this.capabilityIndex.set(capability, filtered);
      }
    }

    // Remove agent
    this.agents.delete(agentId);
    return true;
  }

  /**
   * Get count of registered agents
   *
   * @returns Number of registered agents
   */
  count(): number {
    return this.agents.size;
  }

  /**
   * Clear all registered agents (useful for testing)
   */
  clear(): void {
    this.agents.clear();
    this.capabilityIndex.clear();
  }
}
