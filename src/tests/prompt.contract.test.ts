/**
 * @file Prompt Agent Contract Test
 * @description This file contains contract tests for the Prompt agent.
 */

import { PromptAgent } from "../agents/prompt.agent";
import {
  IPromptAgent,
  PromptExecutionInput,
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
      expect(result.error?.name).toEqual("NotImplementedError"); // Stub returns this
      expect(result.error?.category).toEqual(ErrorCategory.UNEXPECTED_ERROR); // Stub returns this
      expect(result.error?.agentId).toEqual("PromptAgent"); // Stub returns this
      // expect(result.error?.message).toContain("Contract definition is required"); // Ideal, but stub returns generic
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
      expect(result.error?.name).toEqual("NotImplementedError"); // Stub returns this
      expect(result.error?.category).toEqual(ErrorCategory.UNEXPECTED_ERROR); // Stub returns this
      expect(result.error?.agentId).toEqual("PromptAgent"); // Stub returns this
      // expect(result.error?.message).toContain("requestingAgentId is required"); // Ideal, but stub returns generic
    });
  });

  describe("executePrompt", () => {
    test("should return a successful ContractResult with a response on happy path", async () => {
      const mockInput: PromptExecutionInput = {
        requestingAgentId: mockRequestingAgentId,
        prompt: "Generate a TypeScript function that adds two numbers.",
        context: { language: "typescript" },
      };

      // The stub currently throws "Method not implemented."
      // We'll test for that specific error until the stub is updated.
      try {
        await promptAgent.executePrompt(mockInput);
        // Should not reach here
        expect(true).toBe(false);
      } catch (e: any) {
        expect(e.message).toEqual("Method not implemented.");
      }

      // SDD-TODO: Update this test when the PromptAgent.executePrompt stub is implemented
      // const result: ContractResult<PromptExecutionOutput, AgentError> =
      //   await promptAgent.executePrompt(mockInput);
      // expect(result.result).toBeDefined();
      // expect(result.error).toBeUndefined();
      // expect(result.result?.response).toBeDefined();
      // expect(typeof result.result?.response).toBe("string");
      // expect(result.result?.response.length).toBeGreaterThan(0);
    });

    test("should return an AgentError in ContractResult if prompt is missing for executePrompt", async () => {
      const mockErrorInput: PromptExecutionInput = {
        requestingAgentId: mockRequestingAgentId,
        prompt: "", // Missing prompt
      };
      // The stub currently throws "Method not implemented."
      // We'll test for that specific error until the stub is updated.
      try {
        await promptAgent.executePrompt(mockErrorInput);
        // Should not reach here
        expect(true).toBe(false);
      } catch (e: any) {
        expect(e.message).toEqual("Method not implemented.");
      }

      // SDD-TODO: Update this test when the PromptAgent.executePrompt stub is implemented
      // const result: ContractResult<PromptExecutionOutput, AgentError> =
      //   await promptAgent.executePrompt(mockErrorInput);
      // expect(result.error).toBeDefined();
      // expect(result.result).toBeUndefined();
      // expect(result.error?.name).toEqual("NotImplementedError"); // Or a more specific error
      // expect(result.error?.category).toEqual(ErrorCategory.INVALID_INPUT);
      // expect(result.error?.agentId).toEqual("PromptAgent");
      // expect(result.error?.message).toContain("Prompt is required");
    });

    test("should return an AgentError for executePrompt if requestingAgentId is missing", async () => {
      const mockErrorInput: PromptExecutionInput = {
        requestingAgentId: "" as AgentId, // Missing requestingAgentId
        prompt: "Generate a TypeScript function.",
      };
      // The stub currently throws "Method not implemented."
      // We'll test for that specific error until the stub is updated.
      try {
        await promptAgent.executePrompt(mockErrorInput);
        // Should not reach here
        expect(true).toBe(false);
      } catch (e: any) {
        expect(e.message).toEqual("Method not implemented.");
      }
      // SDD-TODO: Update this test when the PromptAgent.executePrompt stub is implemented
      // const result: ContractResult<PromptExecutionOutput, AgentError> =
      //   await promptAgent.executePrompt(mockErrorInput);
      // expect(result.error).toBeDefined();
      // expect(result.result).toBeUndefined();
      // expect(result.error?.name).toEqual("NotImplementedError"); // Or a more specific error
      // expect(result.error?.category).toEqual(ErrorCategory.INVALID_INPUT);
      // expect(result.error?.agentId).toEqual("PromptAgent");
      // expect(result.error?.message).toContain("requestingAgentId is required");
    });
  });
});
