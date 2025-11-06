/**
 * AgentRegistry Test
 *
 * Purpose: Tests AgentRegistry pattern implementation
 * Data Flow: Test data → registry → assertions
 * Integration: Jest test runner
 * Failure Modes: Registration errors, lookup failures, index corruption
 * Rationale: Ensures registry correctly manages agent lifecycle and discovery
 *
 * SDD: SEAM TEST for AgentRegistry pattern
 */

import { AgentRegistry, AgentRegistration } from "../patterns/agentRegistry";

describe("AgentRegistry", () => {
  let registry: AgentRegistry;

  beforeEach(() => {
    registry = new AgentRegistry();
  });

  describe("register", () => {
    test("should successfully register an agent", () => {
      const registration: AgentRegistration = {
        agentId: "test-agent",
        instance: { name: "Test Agent" },
        capabilities: ["testAction"],
        priority: 10,
        description: "Test agent for testing",
      };

      expect(() => registry.register(registration)).not.toThrow();
      expect(registry.has("test-agent")).toBe(true);
    });

    test("should register agent without optional fields", () => {
      const registration: AgentRegistration = {
        agentId: "minimal-agent",
        instance: { name: "Minimal" },
        capabilities: ["action1"],
      };

      expect(() => registry.register(registration)).not.toThrow();
      expect(registry.has("minimal-agent")).toBe(true);
    });

    test("should register agent with multiple capabilities", () => {
      const registration: AgentRegistration = {
        agentId: "multi-cap-agent",
        instance: { name: "Multi Capability" },
        capabilities: ["action1", "action2", "action3"],
        priority: 5,
      };

      registry.register(registration);
      expect(registry.has("multi-cap-agent")).toBe(true);
      expect(registry.getByCapability("action1")).toHaveLength(1);
      expect(registry.getByCapability("action2")).toHaveLength(1);
      expect(registry.getByCapability("action3")).toHaveLength(1);
    });

    test("should throw error when registering duplicate agent ID", () => {
      const registration: AgentRegistration = {
        agentId: "duplicate-agent",
        instance: { name: "First" },
        capabilities: ["action1"],
      };

      registry.register(registration);

      const duplicateRegistration: AgentRegistration = {
        agentId: "duplicate-agent",
        instance: { name: "Second" },
        capabilities: ["action2"],
      };

      expect(() => registry.register(duplicateRegistration)).toThrow(
        "Agent with ID 'duplicate-agent' is already registered"
      );
    });

    test("should index agent by all its capabilities", () => {
      const registration: AgentRegistration = {
        agentId: "indexed-agent",
        instance: { name: "Indexed" },
        capabilities: ["cap1", "cap2", "cap3"],
      };

      registry.register(registration);

      expect(registry.getByCapability("cap1")[0].agentId).toBe("indexed-agent");
      expect(registry.getByCapability("cap2")[0].agentId).toBe("indexed-agent");
      expect(registry.getByCapability("cap3")[0].agentId).toBe("indexed-agent");
    });
  });

  describe("get", () => {
    test("should return agent registration when found", () => {
      const registration: AgentRegistration = {
        agentId: "findable-agent",
        instance: { name: "Findable" },
        capabilities: ["find"],
        priority: 15,
        description: "Can be found",
      };

      registry.register(registration);
      const found = registry.get("findable-agent");

      expect(found).toBeDefined();
      expect(found?.agentId).toBe("findable-agent");
      expect(found?.instance.name).toBe("Findable");
      expect(found?.capabilities).toEqual(["find"]);
      expect(found?.priority).toBe(15);
      expect(found?.description).toBe("Can be found");
    });

    test("should return undefined when agent not found", () => {
      const found = registry.get("non-existent-agent");
      expect(found).toBeUndefined();
    });

    test("should return correct agent from multiple registered agents", () => {
      const agent1: AgentRegistration = {
        agentId: "agent-1",
        instance: { id: 1 },
        capabilities: ["action1"],
      };

      const agent2: AgentRegistration = {
        agentId: "agent-2",
        instance: { id: 2 },
        capabilities: ["action2"],
      };

      const agent3: AgentRegistration = {
        agentId: "agent-3",
        instance: { id: 3 },
        capabilities: ["action3"],
      };

      registry.register(agent1);
      registry.register(agent2);
      registry.register(agent3);

      const found = registry.get("agent-2");
      expect(found?.agentId).toBe("agent-2");
      expect(found?.instance.id).toBe(2);
    });
  });

  describe("getByCapability", () => {
    test("should return empty array when no agents support capability", () => {
      const agents = registry.getByCapability("non-existent-capability");
      expect(agents).toEqual([]);
    });

    test("should return single agent for capability", () => {
      const registration: AgentRegistration = {
        agentId: "single-cap-agent",
        instance: { name: "Single" },
        capabilities: ["uniqueAction"],
        priority: 10,
      };

      registry.register(registration);
      const agents = registry.getByCapability("uniqueAction");

      expect(agents).toHaveLength(1);
      expect(agents[0].agentId).toBe("single-cap-agent");
    });

    test("should return multiple agents supporting same capability", () => {
      const agent1: AgentRegistration = {
        agentId: "shared-1",
        instance: { name: "First" },
        capabilities: ["sharedAction", "unique1"],
        priority: 5,
      };

      const agent2: AgentRegistration = {
        agentId: "shared-2",
        instance: { name: "Second" },
        capabilities: ["sharedAction", "unique2"],
        priority: 10,
      };

      const agent3: AgentRegistration = {
        agentId: "shared-3",
        instance: { name: "Third" },
        capabilities: ["sharedAction", "unique3"],
        priority: 7,
      };

      registry.register(agent1);
      registry.register(agent2);
      registry.register(agent3);

      const agents = registry.getByCapability("sharedAction");
      expect(agents).toHaveLength(3);
    });

    test("should sort agents by priority (highest first)", () => {
      const lowPriority: AgentRegistration = {
        agentId: "low-priority",
        instance: { name: "Low" },
        capabilities: ["sortTest"],
        priority: 1,
      };

      const highPriority: AgentRegistration = {
        agentId: "high-priority",
        instance: { name: "High" },
        capabilities: ["sortTest"],
        priority: 100,
      };

      const mediumPriority: AgentRegistration = {
        agentId: "medium-priority",
        instance: { name: "Medium" },
        capabilities: ["sortTest"],
        priority: 50,
      };

      // Register in random order
      registry.register(mediumPriority);
      registry.register(lowPriority);
      registry.register(highPriority);

      const agents = registry.getByCapability("sortTest");

      expect(agents).toHaveLength(3);
      expect(agents[0].agentId).toBe("high-priority");
      expect(agents[1].agentId).toBe("medium-priority");
      expect(agents[2].agentId).toBe("low-priority");
    });

    test("should treat agents without priority as priority 0", () => {
      const withPriority: AgentRegistration = {
        agentId: "with-priority",
        instance: { name: "With" },
        capabilities: ["priorityTest"],
        priority: 10,
      };

      const withoutPriority: AgentRegistration = {
        agentId: "without-priority",
        instance: { name: "Without" },
        capabilities: ["priorityTest"],
        // No priority specified
      };

      registry.register(withoutPriority);
      registry.register(withPriority);

      const agents = registry.getByCapability("priorityTest");

      expect(agents).toHaveLength(2);
      expect(agents[0].agentId).toBe("with-priority"); // priority 10
      expect(agents[1].agentId).toBe("without-priority"); // priority 0 (default)
    });

    test("should maintain correct order for agents with same priority", () => {
      const agent1: AgentRegistration = {
        agentId: "same-priority-1",
        instance: { name: "First" },
        capabilities: ["samePriority"],
        priority: 10,
      };

      const agent2: AgentRegistration = {
        agentId: "same-priority-2",
        instance: { name: "Second" },
        capabilities: ["samePriority"],
        priority: 10,
      };

      registry.register(agent1);
      registry.register(agent2);

      const agents = registry.getByCapability("samePriority");

      expect(agents).toHaveLength(2);
      // Both have same priority, so they should be in registration order
      expect(agents[0].agentId).toBe("same-priority-1");
      expect(agents[1].agentId).toBe("same-priority-2");
    });
  });

  describe("listAll", () => {
    test("should return empty array when no agents registered", () => {
      const agentIds = registry.listAll();
      expect(agentIds).toEqual([]);
    });

    test("should return single agent ID", () => {
      const registration: AgentRegistration = {
        agentId: "solo-agent",
        instance: { name: "Solo" },
        capabilities: ["action"],
      };

      registry.register(registration);
      const agentIds = registry.listAll();

      expect(agentIds).toEqual(["solo-agent"]);
    });

    test("should return all registered agent IDs", () => {
      const agents: AgentRegistration[] = [
        {
          agentId: "agent-alpha",
          instance: {},
          capabilities: ["cap1"],
        },
        {
          agentId: "agent-beta",
          instance: {},
          capabilities: ["cap2"],
        },
        {
          agentId: "agent-gamma",
          instance: {},
          capabilities: ["cap3"],
        },
      ];

      agents.forEach((agent) => registry.register(agent));
      const agentIds = registry.listAll();

      expect(agentIds).toHaveLength(3);
      expect(agentIds).toContain("agent-alpha");
      expect(agentIds).toContain("agent-beta");
      expect(agentIds).toContain("agent-gamma");
    });

    test("should not include unregistered agents", () => {
      const agent1: AgentRegistration = {
        agentId: "registered-agent",
        instance: {},
        capabilities: ["action"],
      };

      registry.register(agent1);
      registry.unregister("registered-agent");

      const agentIds = registry.listAll();
      expect(agentIds).not.toContain("registered-agent");
    });
  });

  describe("getAllRegistrations", () => {
    test("should return empty array when no agents registered", () => {
      const registrations = registry.getAllRegistrations();
      expect(registrations).toEqual([]);
    });

    test("should return all registration metadata", () => {
      const agent1: AgentRegistration = {
        agentId: "full-agent-1",
        instance: { name: "Agent 1" },
        capabilities: ["cap1", "cap2"],
        priority: 10,
        description: "First agent",
      };

      const agent2: AgentRegistration = {
        agentId: "full-agent-2",
        instance: { name: "Agent 2" },
        capabilities: ["cap3"],
        priority: 5,
        description: "Second agent",
      };

      registry.register(agent1);
      registry.register(agent2);

      const registrations = registry.getAllRegistrations();

      expect(registrations).toHaveLength(2);

      const found1 = registrations.find((r) => r.agentId === "full-agent-1");
      expect(found1).toBeDefined();
      expect(found1?.capabilities).toEqual(["cap1", "cap2"]);
      expect(found1?.priority).toBe(10);

      const found2 = registrations.find((r) => r.agentId === "full-agent-2");
      expect(found2).toBeDefined();
      expect(found2?.capabilities).toEqual(["cap3"]);
      expect(found2?.priority).toBe(5);
    });
  });

  describe("has", () => {
    test("should return false for non-existent agent", () => {
      expect(registry.has("non-existent")).toBe(false);
    });

    test("should return true for registered agent", () => {
      const registration: AgentRegistration = {
        agentId: "existing-agent",
        instance: {},
        capabilities: ["action"],
      };

      registry.register(registration);
      expect(registry.has("existing-agent")).toBe(true);
    });

    test("should return false after agent is unregistered", () => {
      const registration: AgentRegistration = {
        agentId: "temporary-agent",
        instance: {},
        capabilities: ["action"],
      };

      registry.register(registration);
      expect(registry.has("temporary-agent")).toBe(true);

      registry.unregister("temporary-agent");
      expect(registry.has("temporary-agent")).toBe(false);
    });

    test("should distinguish between different agent IDs", () => {
      const agent1: AgentRegistration = {
        agentId: "agent-one",
        instance: {},
        capabilities: ["action"],
      };

      registry.register(agent1);

      expect(registry.has("agent-one")).toBe(true);
      expect(registry.has("agent-two")).toBe(false);
      expect(registry.has("agent-three")).toBe(false);
    });
  });

  describe("unregister", () => {
    test("should return false when unregistering non-existent agent", () => {
      const result = registry.unregister("non-existent-agent");
      expect(result).toBe(false);
    });

    test("should return true when successfully unregistering agent", () => {
      const registration: AgentRegistration = {
        agentId: "removable-agent",
        instance: {},
        capabilities: ["action"],
      };

      registry.register(registration);
      const result = registry.unregister("removable-agent");

      expect(result).toBe(true);
      expect(registry.has("removable-agent")).toBe(false);
    });

    test("should remove agent from capability index", () => {
      const registration: AgentRegistration = {
        agentId: "indexed-removal",
        instance: {},
        capabilities: ["cap1", "cap2", "cap3"],
      };

      registry.register(registration);
      expect(registry.getByCapability("cap1")).toHaveLength(1);
      expect(registry.getByCapability("cap2")).toHaveLength(1);
      expect(registry.getByCapability("cap3")).toHaveLength(1);

      registry.unregister("indexed-removal");

      expect(registry.getByCapability("cap1")).toHaveLength(0);
      expect(registry.getByCapability("cap2")).toHaveLength(0);
      expect(registry.getByCapability("cap3")).toHaveLength(0);
    });

    test("should not affect other agents with shared capabilities", () => {
      const agent1: AgentRegistration = {
        agentId: "shared-cap-1",
        instance: {},
        capabilities: ["sharedCap"],
      };

      const agent2: AgentRegistration = {
        agentId: "shared-cap-2",
        instance: {},
        capabilities: ["sharedCap"],
      };

      registry.register(agent1);
      registry.register(agent2);

      expect(registry.getByCapability("sharedCap")).toHaveLength(2);

      registry.unregister("shared-cap-1");

      const remainingAgents = registry.getByCapability("sharedCap");
      expect(remainingAgents).toHaveLength(1);
      expect(remainingAgents[0].agentId).toBe("shared-cap-2");
    });

    test("should allow re-registration after unregistering", () => {
      const registration: AgentRegistration = {
        agentId: "re-registerable",
        instance: { version: 1 },
        capabilities: ["action"],
      };

      registry.register(registration);
      registry.unregister("re-registerable");

      const newRegistration: AgentRegistration = {
        agentId: "re-registerable",
        instance: { version: 2 },
        capabilities: ["newAction"],
      };

      expect(() => registry.register(newRegistration)).not.toThrow();

      const found = registry.get("re-registerable");
      expect(found?.instance.version).toBe(2);
      expect(found?.capabilities).toEqual(["newAction"]);
    });
  });

  describe("count", () => {
    test("should return 0 for empty registry", () => {
      expect(registry.count()).toBe(0);
    });

    test("should return 1 after registering single agent", () => {
      const registration: AgentRegistration = {
        agentId: "counted-agent",
        instance: {},
        capabilities: ["action"],
      };

      registry.register(registration);
      expect(registry.count()).toBe(1);
    });

    test("should return correct count for multiple agents", () => {
      for (let i = 1; i <= 5; i++) {
        registry.register({
          agentId: `agent-${i}`,
          instance: {},
          capabilities: [`action${i}`],
        });
      }

      expect(registry.count()).toBe(5);
    });

    test("should decrement count after unregistering agent", () => {
      registry.register({
        agentId: "agent-1",
        instance: {},
        capabilities: ["action"],
      });
      registry.register({
        agentId: "agent-2",
        instance: {},
        capabilities: ["action"],
      });

      expect(registry.count()).toBe(2);

      registry.unregister("agent-1");
      expect(registry.count()).toBe(1);

      registry.unregister("agent-2");
      expect(registry.count()).toBe(0);
    });

    test("should not change count when unregistering non-existent agent", () => {
      registry.register({
        agentId: "existing",
        instance: {},
        capabilities: ["action"],
      });

      expect(registry.count()).toBe(1);
      registry.unregister("non-existent");
      expect(registry.count()).toBe(1);
    });
  });

  describe("clear", () => {
    test("should clear empty registry without error", () => {
      expect(() => registry.clear()).not.toThrow();
      expect(registry.count()).toBe(0);
    });

    test("should remove all agents", () => {
      for (let i = 1; i <= 5; i++) {
        registry.register({
          agentId: `agent-${i}`,
          instance: {},
          capabilities: [`action${i}`],
        });
      }

      expect(registry.count()).toBe(5);

      registry.clear();

      expect(registry.count()).toBe(0);
      expect(registry.listAll()).toEqual([]);
    });

    test("should clear capability index", () => {
      registry.register({
        agentId: "cap-agent-1",
        instance: {},
        capabilities: ["cap1", "cap2"],
      });
      registry.register({
        agentId: "cap-agent-2",
        instance: {},
        capabilities: ["cap1", "cap3"],
      });

      expect(registry.getByCapability("cap1")).toHaveLength(2);
      expect(registry.getByCapability("cap2")).toHaveLength(1);
      expect(registry.getByCapability("cap3")).toHaveLength(1);

      registry.clear();

      expect(registry.getByCapability("cap1")).toHaveLength(0);
      expect(registry.getByCapability("cap2")).toHaveLength(0);
      expect(registry.getByCapability("cap3")).toHaveLength(0);
    });

    test("should allow fresh registration after clear", () => {
      registry.register({
        agentId: "temp-agent",
        instance: {},
        capabilities: ["temp"],
      });

      registry.clear();

      const newRegistration: AgentRegistration = {
        agentId: "fresh-agent",
        instance: { name: "Fresh" },
        capabilities: ["fresh"],
      };

      expect(() => registry.register(newRegistration)).not.toThrow();
      expect(registry.count()).toBe(1);
      expect(registry.has("fresh-agent")).toBe(true);
      expect(registry.has("temp-agent")).toBe(false);
    });

    test("should allow re-registration of previously registered agent after clear", () => {
      const registration: AgentRegistration = {
        agentId: "recyclable-agent",
        instance: { version: 1 },
        capabilities: ["action"],
      };

      registry.register(registration);
      registry.clear();

      expect(() => registry.register(registration)).not.toThrow();
      expect(registry.has("recyclable-agent")).toBe(true);
    });
  });

  describe("integration scenarios", () => {
    test("should support complete agent lifecycle", () => {
      // Register
      const registration: AgentRegistration = {
        agentId: "lifecycle-agent",
        instance: { name: "Lifecycle Test" },
        capabilities: ["action1", "action2"],
        priority: 10,
        description: "Testing full lifecycle",
      };

      registry.register(registration);
      expect(registry.count()).toBe(1);

      // Lookup by ID
      const found = registry.get("lifecycle-agent");
      expect(found?.agentId).toBe("lifecycle-agent");

      // Lookup by capability
      const byAction1 = registry.getByCapability("action1");
      expect(byAction1).toHaveLength(1);
      expect(byAction1[0].agentId).toBe("lifecycle-agent");

      // Check existence
      expect(registry.has("lifecycle-agent")).toBe(true);

      // List all
      expect(registry.listAll()).toContain("lifecycle-agent");

      // Unregister
      expect(registry.unregister("lifecycle-agent")).toBe(true);
      expect(registry.count()).toBe(0);
      expect(registry.has("lifecycle-agent")).toBe(false);
      expect(registry.getByCapability("action1")).toHaveLength(0);
    });

    test("should handle complex multi-agent scenario", () => {
      // Register multiple agents with overlapping capabilities
      const agents: AgentRegistration[] = [
        {
          agentId: "knowledge-agent",
          instance: { type: "knowledge" },
          capabilities: ["retrieve", "store", "search"],
          priority: 100,
        },
        {
          agentId: "cache-agent",
          instance: { type: "cache" },
          capabilities: ["retrieve", "store"],
          priority: 50,
        },
        {
          agentId: "search-agent",
          instance: { type: "search" },
          capabilities: ["search"],
          priority: 75,
        },
      ];

      agents.forEach((agent) => registry.register(agent));

      // Verify all registered
      expect(registry.count()).toBe(3);
      expect(registry.listAll()).toHaveLength(3);

      // Verify capability-based lookup with priority sorting
      const retrievers = registry.getByCapability("retrieve");
      expect(retrievers).toHaveLength(2);
      expect(retrievers[0].agentId).toBe("knowledge-agent"); // Higher priority
      expect(retrievers[1].agentId).toBe("cache-agent");

      const storers = registry.getByCapability("store");
      expect(storers).toHaveLength(2);
      expect(storers[0].agentId).toBe("knowledge-agent");

      const searchers = registry.getByCapability("search");
      expect(searchers).toHaveLength(2);
      expect(searchers[0].agentId).toBe("knowledge-agent"); // Priority 100
      expect(searchers[1].agentId).toBe("search-agent"); // Priority 75

      // Remove one agent and verify index integrity
      registry.unregister("cache-agent");
      expect(registry.count()).toBe(2);

      const retrieversAfter = registry.getByCapability("retrieve");
      expect(retrieversAfter).toHaveLength(1);
      expect(retrieversAfter[0].agentId).toBe("knowledge-agent");

      // Clear and verify clean state
      registry.clear();
      expect(registry.count()).toBe(0);
      expect(registry.getByCapability("retrieve")).toHaveLength(0);
      expect(registry.getByCapability("store")).toHaveLength(0);
      expect(registry.getByCapability("search")).toHaveLength(0);
    });
  });
});
