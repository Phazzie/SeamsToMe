/**
 * PURPOSE: Test AgentDispatcher pattern implementation
 * DATA FLOW: Test → AgentDispatcher → AgentRegistry → Mock Agents
 * INTEGRATION POINTS: AgentDispatcher, AgentRegistry
 * CONTRACT VERSION: v1
 * ERROR HANDLING: Tests various error cases for dispatch operations
 */

import { AgentDispatcher, DispatchRequest } from "../patterns/agentDispatcher";
import { AgentRegistry, AgentRegistration } from "../patterns/agentRegistry";
import {
  ContractResult,
  ErrorCategory,
  success,
  failure,
  createAgentError,
} from "../contracts/types";

/**
 * Mock agent for testing dispatcher
 */
class MockAgent {
  /**
   * Successful test action
   */
  async testAction(payload: any): Promise<ContractResult<any>> {
    return success({ message: "Test action executed", payload });
  }

  /**
   * Action that returns a failure
   */
  async failingAction(payload: any): Promise<ContractResult<any>> {
    return failure(
      createAgentError(
        "mock-agent",
        "Action failed intentionally",
        ErrorCategory.BUSINESS_LOGIC_ERROR,
        "MockActionError"
      )
    );
  }

  /**
   * Action that throws an error
   */
  async throwingAction(payload: any): Promise<ContractResult<any>> {
    throw new Error("Unexpected error in action");
  }

  /**
   * Action that processes complex data
   */
  async processData(payload: {
    data: string;
    options?: Record<string, any>;
  }): Promise<ContractResult<{ processed: boolean; data: string }>> {
    return success({
      processed: true,
      data: payload.data.toUpperCase(),
    });
  }

  /**
   * Not a function - should not be dispatchable
   */
  notAFunction = "This is not a function";
}

/**
 * Another mock agent for multi-agent testing
 */
class AnotherMockAgent {
  async anotherAction(payload: any): Promise<ContractResult<string>> {
    return success("Another agent response");
  }
}

describe("AgentDispatcher", () => {
  let registry: AgentRegistry;
  let dispatcher: AgentDispatcher;
  let mockAgent: MockAgent;
  let anotherMockAgent: AnotherMockAgent;

  beforeEach(() => {
    // Create fresh instances for each test
    registry = new AgentRegistry();
    dispatcher = new AgentDispatcher(registry);
    mockAgent = new MockAgent();
    anotherMockAgent = new AnotherMockAgent();

    // Register the mock agent
    registry.register({
      agentId: "mock-agent",
      instance: mockAgent,
      capabilities: [
        "testAction",
        "failingAction",
        "throwingAction",
        "processData",
      ],
      description: "Mock agent for testing",
    });
  });

  describe("dispatch()", () => {
    describe("successful dispatch", () => {
      test("should dispatch to a valid agent and action", async () => {
        const request: DispatchRequest = {
          agentId: "mock-agent",
          action: "testAction",
          payload: { test: "data" },
        };

        const result = await dispatcher.dispatch(request);

        expect(result.success).toBe(true);
        expect(result.result).toEqual({
          message: "Test action executed",
          payload: { test: "data" },
        });
      });

      test("should pass payload correctly to the agent method", async () => {
        const request: DispatchRequest = {
          agentId: "mock-agent",
          action: "processData",
          payload: {
            data: "test data",
            options: { format: "json" },
          },
        };

        const result = await dispatcher.dispatch(request);

        expect(result.success).toBe(true);
        expect(result.result).toEqual({
          processed: true,
          data: "TEST DATA",
        });
      });

      test("should handle agent methods that return failure", async () => {
        const request: DispatchRequest = {
          agentId: "mock-agent",
          action: "failingAction",
          payload: {},
        };

        const result = await dispatcher.dispatch(request);

        expect(result.success).toBe(false);
        expect(result.error).toBeDefined();
        expect(result.error!.message).toBe("Action failed intentionally");
        expect(result.error!.category).toBe(ErrorCategory.BUSINESS_LOGIC_ERROR);
      });

      test("should include requestingAgentId in context", async () => {
        const request: DispatchRequest = {
          agentId: "mock-agent",
          action: "testAction",
          payload: { test: "data" },
          requestingAgentId: "orchestrator",
        };

        const result = await dispatcher.dispatch(request);

        expect(result.success).toBe(true);
      });
    });

    describe("agent not found", () => {
      test("should return error when agent is not registered", async () => {
        const request: DispatchRequest = {
          agentId: "non-existent-agent",
          action: "someAction",
          payload: {},
        };

        const result = await dispatcher.dispatch(request);

        expect(result.success).toBe(false);
        expect(result.error).toBeDefined();
        expect(result.error!.category).toBe(ErrorCategory.AGENT_UNAVAILABLE);
        expect(result.error!.message).toContain("non-existent-agent");
        expect(result.error!.message).toContain("not found in registry");
        expect(result.error!.name).toBe("AgentNotFoundError");
      });

      test("should include available agents in error details", async () => {
        const request: DispatchRequest = {
          agentId: "non-existent-agent",
          action: "someAction",
          payload: {},
          requestingAgentId: "test-agent",
        };

        const result = await dispatcher.dispatch(request);

        expect(result.success).toBe(false);
        expect(result.error!.details).toBeDefined();
        expect(result.error!.details.agentId).toBe("non-existent-agent");
        expect(result.error!.details.availableAgents).toEqual(["mock-agent"]);
        expect(result.error!.requestingAgentId).toBe("test-agent");
      });
    });

    describe("action not found", () => {
      test("should return error when action does not exist on agent", async () => {
        const request: DispatchRequest = {
          agentId: "mock-agent",
          action: "nonExistentAction",
          payload: {},
        };

        const result = await dispatcher.dispatch(request);

        expect(result.success).toBe(false);
        expect(result.error).toBeDefined();
        expect(result.error!.category).toBe(ErrorCategory.INVALID_REQUEST);
        expect(result.error!.message).toContain("nonExistentAction");
        expect(result.error!.message).toContain("not found on agent");
        expect(result.error!.name).toBe("ActionNotFoundError");
      });

      test("should return error when action is not a function", async () => {
        const request: DispatchRequest = {
          agentId: "mock-agent",
          action: "notAFunction",
          payload: {},
        };

        const result = await dispatcher.dispatch(request);

        expect(result.success).toBe(false);
        expect(result.error).toBeDefined();
        expect(result.error!.category).toBe(ErrorCategory.INVALID_REQUEST);
        expect(result.error!.name).toBe("ActionNotFoundError");
      });

      test("should include available capabilities in error details", async () => {
        const request: DispatchRequest = {
          agentId: "mock-agent",
          action: "invalidAction",
          payload: {},
          requestingAgentId: "test-agent",
        };

        const result = await dispatcher.dispatch(request);

        expect(result.success).toBe(false);
        expect(result.error!.details).toBeDefined();
        expect(result.error!.details.agentId).toBe("mock-agent");
        expect(result.error!.details.action).toBe("invalidAction");
        expect(result.error!.details.availableCapabilities).toEqual([
          "testAction",
          "failingAction",
          "throwingAction",
          "processData",
        ]);
      });
    });

    describe("invalid request", () => {
      test("should return error when request is null", async () => {
        const result = await dispatcher.dispatch(null as any);

        expect(result.success).toBe(false);
        expect(result.error).toBeDefined();
        expect(result.error!.category).toBe(ErrorCategory.INVALID_REQUEST);
        expect(result.error!.message).toContain("must include agentId and action");
        expect(result.error!.name).toBe("InvalidDispatchRequest");
      });

      test("should return error when request is undefined", async () => {
        const result = await dispatcher.dispatch(undefined as any);

        expect(result.success).toBe(false);
        expect(result.error).toBeDefined();
        expect(result.error!.category).toBe(ErrorCategory.INVALID_REQUEST);
        expect(result.error!.message).toContain("must include agentId and action");
      });

      test("should return error when agentId is missing", async () => {
        const request = {
          action: "testAction",
          payload: {},
        } as DispatchRequest;

        const result = await dispatcher.dispatch(request);

        expect(result.success).toBe(false);
        expect(result.error).toBeDefined();
        expect(result.error!.category).toBe(ErrorCategory.INVALID_REQUEST);
        expect(result.error!.message).toContain("must include agentId and action");
      });

      test("should return error when action is missing", async () => {
        const request = {
          agentId: "mock-agent",
          payload: {},
        } as DispatchRequest;

        const result = await dispatcher.dispatch(request);

        expect(result.success).toBe(false);
        expect(result.error).toBeDefined();
        expect(result.error!.category).toBe(ErrorCategory.INVALID_REQUEST);
        expect(result.error!.message).toContain("must include agentId and action");
      });

      test("should return error when both agentId and action are missing", async () => {
        const request = {
          payload: {},
        } as DispatchRequest;

        const result = await dispatcher.dispatch(request);

        expect(result.success).toBe(false);
        expect(result.error).toBeDefined();
        expect(result.error!.category).toBe(ErrorCategory.INVALID_REQUEST);
      });
    });

    describe("method invocation errors", () => {
      test("should handle errors thrown by agent methods", async () => {
        const request: DispatchRequest = {
          agentId: "mock-agent",
          action: "throwingAction",
          payload: {},
        };

        const result = await dispatcher.dispatch(request);

        expect(result.success).toBe(false);
        expect(result.error).toBeDefined();
        expect(result.error!.category).toBe(ErrorCategory.UNEXPECTED_ERROR);
        expect(result.error!.name).toBe("DispatchError");
        expect(result.error!.message).toContain("Dispatch to mock-agent.throwingAction failed");
        expect(result.error!.message).toContain("Unexpected error in action");
      });

      test("should include error details when method throws", async () => {
        const request: DispatchRequest = {
          agentId: "mock-agent",
          action: "throwingAction",
          payload: { test: "data" },
          requestingAgentId: "test-agent",
        };

        const result = await dispatcher.dispatch(request);

        expect(result.success).toBe(false);
        expect(result.error!.details).toBeDefined();
        expect(result.error!.details.agentId).toBe("mock-agent");
        expect(result.error!.details.action).toBe("throwingAction");
        expect(result.error!.details.originalError).toBe("Unexpected error in action");
        expect(result.error!.details.stack).toBeDefined();
        expect(result.error!.requestingAgentId).toBe("test-agent");
      });
    });
  });

  describe("canDispatch()", () => {
    describe("returns true", () => {
      test("should return true when agent and action exist", () => {
        const canDispatch = dispatcher.canDispatch("mock-agent", "testAction");

        expect(canDispatch).toBe(true);
      });

      test("should return true for all valid actions on an agent", () => {
        expect(dispatcher.canDispatch("mock-agent", "testAction")).toBe(true);
        expect(dispatcher.canDispatch("mock-agent", "failingAction")).toBe(true);
        expect(dispatcher.canDispatch("mock-agent", "throwingAction")).toBe(true);
        expect(dispatcher.canDispatch("mock-agent", "processData")).toBe(true);
      });
    });

    describe("returns false", () => {
      test("should return false when agent does not exist", () => {
        const canDispatch = dispatcher.canDispatch(
          "non-existent-agent",
          "someAction"
        );

        expect(canDispatch).toBe(false);
      });

      test("should return false when action does not exist on agent", () => {
        const canDispatch = dispatcher.canDispatch(
          "mock-agent",
          "nonExistentAction"
        );

        expect(canDispatch).toBe(false);
      });

      test("should return false when action is not a function", () => {
        const canDispatch = dispatcher.canDispatch(
          "mock-agent",
          "notAFunction"
        );

        expect(canDispatch).toBe(false);
      });

      test("should return false for empty action name", () => {
        const canDispatch = dispatcher.canDispatch("mock-agent", "");

        expect(canDispatch).toBe(false);
      });
    });

    describe("multiple agents", () => {
      beforeEach(() => {
        // Register another agent
        registry.register({
          agentId: "another-agent",
          instance: anotherMockAgent,
          capabilities: ["anotherAction"],
          description: "Another mock agent",
        });
      });

      test("should correctly identify dispatchable actions across multiple agents", () => {
        expect(dispatcher.canDispatch("mock-agent", "testAction")).toBe(true);
        expect(dispatcher.canDispatch("another-agent", "anotherAction")).toBe(true);
        expect(dispatcher.canDispatch("mock-agent", "anotherAction")).toBe(false);
        expect(dispatcher.canDispatch("another-agent", "testAction")).toBe(false);
      });
    });
  });

  describe("getAvailableActions()", () => {
    describe("agent exists", () => {
      test("should return actions when agent is registered", () => {
        const actions = dispatcher.getAvailableActions("mock-agent");

        expect(actions).toEqual([
          "testAction",
          "failingAction",
          "throwingAction",
          "processData",
        ]);
      });

      test("should return correct actions for different agents", () => {
        registry.register({
          agentId: "another-agent",
          instance: anotherMockAgent,
          capabilities: ["anotherAction"],
          description: "Another mock agent",
        });

        const mockActions = dispatcher.getAvailableActions("mock-agent");
        const anotherActions = dispatcher.getAvailableActions("another-agent");

        expect(mockActions).toEqual([
          "testAction",
          "failingAction",
          "throwingAction",
          "processData",
        ]);
        expect(anotherActions).toEqual(["anotherAction"]);
      });
    });

    describe("agent doesn't exist", () => {
      test("should return empty array when agent is not registered", () => {
        const actions = dispatcher.getAvailableActions("non-existent-agent");

        expect(actions).toEqual([]);
      });

      test("should return empty array for empty agent ID", () => {
        const actions = dispatcher.getAvailableActions("");

        expect(actions).toEqual([]);
      });
    });

    describe("empty capabilities", () => {
      test("should handle agent with no capabilities", () => {
        registry.register({
          agentId: "empty-agent",
          instance: {},
          capabilities: [],
          description: "Agent with no capabilities",
        });

        const actions = dispatcher.getAvailableActions("empty-agent");

        expect(actions).toEqual([]);
      });
    });
  });

  describe("integration scenarios", () => {
    test("should handle complete workflow: check, dispatch, verify", async () => {
      // 1. Check if we can dispatch
      expect(dispatcher.canDispatch("mock-agent", "testAction")).toBe(true);

      // 2. Get available actions
      const actions = dispatcher.getAvailableActions("mock-agent");
      expect(actions).toContain("testAction");

      // 3. Dispatch the request
      const result = await dispatcher.dispatch({
        agentId: "mock-agent",
        action: "testAction",
        payload: { data: "test" },
      });

      expect(result.success).toBe(true);
    });

    test("should handle workflow with non-existent agent", async () => {
      // 1. Check if we can dispatch
      expect(dispatcher.canDispatch("non-existent", "action")).toBe(false);

      // 2. Get available actions
      const actions = dispatcher.getAvailableActions("non-existent");
      expect(actions).toEqual([]);

      // 3. Dispatch should fail
      const result = await dispatcher.dispatch({
        agentId: "non-existent",
        action: "action",
        payload: {},
      });

      expect(result.success).toBe(false);
      expect(result.error!.category).toBe(ErrorCategory.AGENT_UNAVAILABLE);
    });

    test("should handle workflow with invalid action", async () => {
      // 1. Check if we can dispatch
      expect(dispatcher.canDispatch("mock-agent", "invalidAction")).toBe(false);

      // 2. Get available actions shows what's valid
      const actions = dispatcher.getAvailableActions("mock-agent");
      expect(actions).not.toContain("invalidAction");

      // 3. Dispatch should fail
      const result = await dispatcher.dispatch({
        agentId: "mock-agent",
        action: "invalidAction",
        payload: {},
      });

      expect(result.success).toBe(false);
      expect(result.error!.category).toBe(ErrorCategory.INVALID_REQUEST);
    });
  });
});
