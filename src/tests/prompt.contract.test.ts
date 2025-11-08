/**
 * @file Prompt Agent Contract Test
 * @description This file contains contract tests for the Prompt agent.
 */

import { PromptAgent } from "../agents/prompt.agent";
import {
  IPromptAgent,
  PromptExecutionInput,
  PromptExecutionOutput,
  PromptInput,
  PromptOutput,
} from "../contracts/prompt.contract";
import {
  AgentError,
  AgentId,
  ContractResult,
  ErrorCategory,
} from "../contracts/types";

const mockRequestingAgentId: AgentId = "test-orchestrator";
const mockPromptAgentId: AgentId = "prompt-agent";

describe("PromptAgent Contract Tests", () => {
  let promptAgent: IPromptAgent;

  beforeEach(() => {
    promptAgent = new PromptAgent();
    // Assuming the agentId is set internally or via a setter if needed for the stub
    // (promptAgent as PromptAgent).agentId = mockPromptAgentId;
  });

  test("should conform to IPromptAgent contract", () => {
    expect(typeof promptAgent.generatePrompt).toBe("function");
    expect(typeof promptAgent.executePrompt).toBe("function");
  });

  describe("generatePrompt", () => {
    test("should return a successful ContractResult with a prompt on happy path", async () => {
      const mockInput: PromptInput = {
        requestingAgentId: mockRequestingAgentId,
        contract: "interface MyService { doSomething(): string; }",
        documentation: "This service performs a critical task.",
        taskType: "code-gen",
      };

      const result: ContractResult<PromptOutput, AgentError> =
        await promptAgent.generatePrompt(mockInput);

      expect(result.result).toBeDefined();
      expect(result.error).toBeUndefined();
      expect(result.result?.prompt).toBeDefined();
      expect(typeof result.result?.prompt).toBe("string");
      expect(result.result?.prompt.length).toBeGreaterThan(0);
      // Further checks on prompt content can be added if the stub provides consistent mock data
      // For a stub, we mainly check structure and type.
      if (result.result?.rationale) {
        expect(typeof result.result.rationale).toBe("string");
      }
    });

    test("should return an AgentError in ContractResult if contract is missing", async () => {
      const mockErrorInput: PromptInput = {
        requestingAgentId: mockRequestingAgentId,
        contract: "", // Missing contract
      };

      const result: ContractResult<PromptOutput, AgentError> =
        await promptAgent.generatePrompt(mockErrorInput);

      expect(result.error).toBeDefined();
      expect(result.result).toBeUndefined();
      expect(result.error?.name).toEqual("ValidationError"); // BaseAgent pattern
      expect(result.error?.category).toEqual(ErrorCategory.VALIDATION_ERROR); // BaseAgent pattern
      expect(result.error?.agentId).toEqual("PromptAgent");
      expect(result.error?.message).toContain("contract cannot be empty"); // BaseAgent validation message
    });

    test("should return an AgentError for generatePrompt if requestingAgentId is missing", async () => {
      const mockErrorInput: PromptInput = {
        requestingAgentId: "" as AgentId, // Missing requestingAgentId
        contract: "interface MyService { doSomething(): string; }",
      };

      const result: ContractResult<PromptOutput, AgentError> =
        await promptAgent.generatePrompt(mockErrorInput);

      expect(result.error).toBeDefined();
      expect(result.result).toBeUndefined();
      expect(result.error?.name).toEqual("ValidationError"); // BaseAgent pattern
      expect(result.error?.category).toEqual(ErrorCategory.VALIDATION_ERROR); // BaseAgent pattern
      expect(result.error?.agentId).toEqual("PromptAgent");
      expect(result.error?.message).toContain("requestingAgentId cannot be empty"); // BaseAgent validation message
    });
  });

  describe("executePrompt", () => {
    test("should return a NotImplementedError because executePrompt is not implemented yet", async () => {
      const mockInput: PromptExecutionInput = {
        requestingAgentId: mockRequestingAgentId,
        prompt: "Generate a TypeScript function that adds two numbers.",
        context: { language: "typescript" },
      };

      const result: ContractResult<PromptExecutionOutput, AgentError> =
        await promptAgent.executePrompt(mockInput);

      expect(result.success).toBe(false);
      expect(result.result).toBeUndefined();
      expect(result.error).toBeDefined();
      expect(result.error?.name).toEqual("NotImplementedError");
      expect(result.error?.category).toEqual(ErrorCategory.NOT_IMPLEMENTED);
      expect(result.error?.agentId).toEqual("PromptAgent");
      expect(result.error?.message).toContain("executePrompt");

      // SDD-TODO: Update this test when the PromptAgent.executePrompt stub is implemented
      // expect(result.result).toBeDefined();
      // expect(result.error).toBeUndefined();
      // expect(result.result?.response).toBeDefined();
      // expect(typeof result.result?.response).toBe("string");
      // expect(result.result?.response.length).toBeGreaterThan(0);
    });

    test("should return a NotImplementedError if prompt is missing for executePrompt", async () => {
      const mockErrorInput: PromptExecutionInput = {
        requestingAgentId: mockRequestingAgentId,
        prompt: "", // Missing prompt
      };

      const result: ContractResult<PromptExecutionOutput, AgentError> =
        await promptAgent.executePrompt(mockErrorInput);

      // Currently returns NotImplementedError because method is not implemented
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.result).toBeUndefined();
      expect(result.error?.name).toEqual("NotImplementedError");
      expect(result.error?.category).toEqual(ErrorCategory.NOT_IMPLEMENTED);
      expect(result.error?.agentId).toEqual("PromptAgent");

      // SDD-TODO: Update this test when the PromptAgent.executePrompt stub is implemented
      // Should then return VALIDATION_ERROR instead
      // expect(result.error?.category).toEqual(ErrorCategory.VALIDATION_ERROR);
      // expect(result.error?.message).toContain("Prompt is required");
    });

    test("should return a NotImplementedError for executePrompt if requestingAgentId is missing", async () => {
      const mockErrorInput: PromptExecutionInput = {
        requestingAgentId: "" as AgentId, // Missing requestingAgentId
        prompt: "Generate a TypeScript function.",
      };

      const result: ContractResult<PromptExecutionOutput, AgentError> =
        await promptAgent.executePrompt(mockErrorInput);

      // Currently returns NotImplementedError because method is not implemented
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.result).toBeUndefined();
      expect(result.error?.name).toEqual("NotImplementedError");
      expect(result.error?.category).toEqual(ErrorCategory.NOT_IMPLEMENTED);
      expect(result.error?.agentId).toEqual("PromptAgent");

      // SDD-TODO: Update this test when the PromptAgent.executePrompt stub is implemented
      // Should then return VALIDATION_ERROR instead
      // expect(result.error?.category).toEqual(ErrorCategory.VALIDATION_ERROR);
      // expect(result.error?.message).toContain("requestingAgentId is required");
    });
  });
});
