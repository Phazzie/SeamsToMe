/**
 * @file Refactoring Assistant Agent Contract Test
 * @description Contract tests for the Refactoring Assistant Agent.
 * These tests are based on the RefactorAgentContract with analyzeCodeForRefactoring and applyRefactoring methods.
 * The RefactorAgent is expected to throw NotImplementedError for these methods until implemented.
 */

import { RefactorAgent } from "../agents/refactor.agent";
import {
  RefactoringAssistantAgentContract as IRefactorAgent,
  RefactorInput,
  RefactorOutput,
  RefactorRequest, // Import RefactorRequest to use its properties
} from "../contracts/refactor.contract";
import {
  AgentError,
  AgentId,
  ContractResult,
  ErrorCategory,
  NotImplementedError,
} from "../contracts/types";

const mockRequestingAgentId: AgentId = "test-orchestrator-agent";
const expectedRefactorAgentId: AgentId = "RefactorAgent"; // Match the agent's actual ID

describe("RefactorAgent Contract Tests", () => {
  let agent: IRefactorAgent;

  beforeEach(() => {
    agent = new RefactorAgent();
  });

  test("should conform to IRefactorAgent (method existence)", () => {
    expect(typeof agent.refactor).toBe("function");
  });

  describe("refactor method", () => {
    const validCodeContent = "function example() { console.log('Hello'); }";
    // const validFilePath = "src/example.js"; // FilePath is not part of RefactorRequest

    test("should return AGENT_UNAVAILABLE error when AI service is not available", async () => {
      const mockInput: RefactorInput = {
        requestingAgentId: mockRequestingAgentId,
        code: validCodeContent, // Changed from codeToRefactor to code
        // filePath: validFilePath, // Removed filePath as it's not in RefactorRequest
        goals: ["Improve readability"], // Changed from refactoringGoal to goals array
      };

      const result: ContractResult<
        RefactorOutput,
        AgentError | NotImplementedError
      > = await agent.refactor(mockInput);

      expect(result.success).toBe(false);
      expect(result.result).toBeUndefined();
      expect(result.error).toBeDefined();
      expect(result.error?.agentId).toEqual(expectedRefactorAgentId);
      expect(result.error?.category).toEqual(ErrorCategory.AGENT_UNAVAILABLE);
      expect(result.error?.message).toContain("AI service not available");
      if (result.error && "requestingAgentId" in result.error) {
        expect((result.error as AgentError).requestingAgentId).toEqual(
          mockRequestingAgentId
        );
      }
    });

    test("should return an AgentError if request is null", async () => {
      // @ts-expect-error Testing invalid input
      const result = await agent.refactor(null);
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error?.agentId).toEqual(expectedRefactorAgentId);
      expect(result.error?.category).toEqual(ErrorCategory.BAD_REQUEST);
      expect(result.error?.message).toContain("Request is null or undefined");
    });

    test("should return VALIDATION_ERROR if code is missing", async () => {
      const mockErrorInput: Partial<RefactorRequest> = {
        // Use Partial for incomplete input
        requestingAgentId: mockRequestingAgentId,
        // code: "", // Missing code
        goals: ["Improve readability"],
      };

      const result = await agent.refactor(mockErrorInput as RefactorInput); // Cast for the call
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error?.agentId).toEqual(expectedRefactorAgentId);
      expect(result.error?.category).toEqual(ErrorCategory.VALIDATION_ERROR);
      expect(result.error?.message).toContain("code");
      if (result.error && "requestingAgentId" in result.error) {
        expect((result.error as AgentError).requestingAgentId).toEqual(
          mockRequestingAgentId
        );
      }
    });
  });
});
