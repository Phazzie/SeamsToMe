// filepath: c:\Users\thump\SeemsToMe\src\tests\orchestrator.contract.test.ts
/**
 * PURPOSE: Test contract conformance for the Orchestrator Agent
 * DATA FLOW: Test ↔ Orchestrator Agent
 * INTEGRATION POINTS: Orchestrator Contract
 * CONTRACT VERSION: v1
 * ERROR HANDLING: Tests various error cases defined in the contract
 */

import { OrchestratorAgent } from "../agents/orchestrator.agent";
import {
  OrchestratorContract,
  TaskRequest,
} from "../contracts/orchestrator.contract";
import {
  AgentId,
  ErrorCategory,
  TaskPriority,
  TaskStatus,
  success,
} from "../contracts/types";
import { AgentRegistration } from "../patterns/agentRegistry";

describe("Orchestrator Contract Conformance", () => {
  let orchestrator: OrchestratorContract;
  const testAgentId: AgentId = "test-agent";

  // Mock agent instance for testing
  const mockAgent = {
    test: async (params: any) => {
      return success({ message: "test success", params });
    },
  };

  beforeEach(() => {
    // Create a fresh instance for each test
    // New constructor requires AgentRegistration array
    orchestrator = new OrchestratorAgent([]);
  });
  describe("registerAgent", () => {
    test("should fail when trying to register agent dynamically", async () => {
      const capabilities = ["test", "mock"];
      const result = await orchestrator.registerAgent(
        testAgentId,
        capabilities
      );
      // New pattern: Dynamic registration not supported
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error!.category).toBe(ErrorCategory.OPERATION_FAILED);
      expect(result.error!.message).toContain("not supported");
    });

    test("should fail for duplicate registration attempt", async () => {
      const capabilities = ["test"];
      const result = await orchestrator.registerAgent(
        testAgentId,
        capabilities
      );
      // New pattern: Dynamic registration not supported
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error!.category).toBe(ErrorCategory.OPERATION_FAILED);
    });
  });
  describe("deregisterAgent", () => {
    test("should deregister an existing agent", async () => {
      // Register agent via constructor (new pattern)
      const registration: AgentRegistration = {
        agentId: testAgentId,
        instance: mockAgent,
        capabilities: ["test"],
        description: "Test agent for unit tests",
      };
      const orchestratorWithAgent = new OrchestratorAgent([registration]);

      const result = await orchestratorWithAgent.deregisterAgent(testAgentId);
      expect(result.success).toBe(true);
      expect(result.result).toBe(true);
    });

    test("should fail when deregistering a non-existent agent", async () => {
      const result = await orchestrator.deregisterAgent("non-existent-agent");
      // New pattern: Returns failure instead of false
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error!.category).toBe(ErrorCategory.AGENT_UNAVAILABLE);
    });
  });
  describe("submitTask", () => {
    test("should accept a task for a registered agent", async () => {
      // Register agent via constructor (new pattern)
      const registration: AgentRegistration = {
        agentId: testAgentId,
        instance: mockAgent,
        capabilities: ["test"],
        description: "Test agent for unit tests",
      };
      const orchestratorWithAgent = new OrchestratorAgent([registration]);

      const taskRequest: TaskRequest = {
        taskId: "test-task",
        agentId: testAgentId,
        action: "test",
        parameters: { test: "value" },
        priority: TaskPriority.NORMAL,
      };

      const result = await orchestratorWithAgent.submitTask(taskRequest);
      // New pattern: Mock agent has "test" method, so task should succeed
      expect(result.success).toBe(true);
      expect(result.result).toBeDefined();
      expect(result.result!.status).toBe(TaskStatus.COMPLETED);
    });

    test("should reject a task for an unregistered agent", async () => {
      const taskRequest: TaskRequest = {
        taskId: "test-task",
        agentId: "unregistered-agent",
        action: "test",
        parameters: {},
        priority: TaskPriority.NORMAL,
      };

      const result = await orchestrator.submitTask(taskRequest);
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error!.category).toBe(ErrorCategory.AGENT_UNAVAILABLE);
    });
  });
  describe("getTaskStatus", () => {
    test("should get status for an existing task", async () => {
      // Register agent via constructor (new pattern)
      const registration: AgentRegistration = {
        agentId: testAgentId,
        instance: mockAgent,
        capabilities: ["test"],
        description: "Test agent for unit tests",
      };
      const orchestratorWithAgent = new OrchestratorAgent([registration]);

      const taskRequest: TaskRequest = {
        taskId: "test-task",
        agentId: testAgentId,
        action: "test",
        parameters: {},
        priority: TaskPriority.NORMAL,
      };

      await orchestratorWithAgent.submitTask(taskRequest);
      const result = await orchestratorWithAgent.getTaskStatus(taskRequest.taskId);
      expect(result.success).toBe(true);
      // New pattern: Mock agent has "test" method, so task completes successfully
      expect(result.result).toBe(TaskStatus.COMPLETED);
    });

    test("should return error for non-existent task", async () => {
      const result = await orchestrator.getTaskStatus("non-existent-task");
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      // New pattern: Task not found returns AGENT_UNAVAILABLE
      expect(result.error!.category).toBe(ErrorCategory.AGENT_UNAVAILABLE);
    });
  });
});
