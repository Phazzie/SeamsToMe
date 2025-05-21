// filepath: c:\Users\thump\SeemsToMe\src\tests\pair.contract.test.ts
/**
 * @file AI Pair Programmer Agent Contract Test
 * @description This file contains contract tests for the AI Pair Programmer agent.
 */

import { PairAgent } from "../agents/pair.agent";
import { IPairAgent, PairInput, PairOutput } from "../contracts/pair.contract";
import {
  AgentError,
  AgentId,
  ContractResult,
  ErrorCategory,
} from "../contracts/types";

const mockRequestingAgentId: AgentId = "test-orchestrator";
const mockPairAgentId: AgentId = "pair-agent";

describe("PairAgent Contract Tests", () => {
  let pairAgent: IPairAgent;

  beforeEach(() => {
    pairAgent = new PairAgent();
    (pairAgent as PairAgent).agentId = mockPairAgentId;
  });

  test("should conform to IPairAgentContract", () => {
    expect(typeof pairAgent.generateCode).toBe("function");
  });

  describe("generateCode", () => {
    test("should return a successful ContractResult with generated code on happy path", async () => {
      const mockInput: PairInput = {
        requestingAgentId: mockRequestingAgentId,
        contract: "interface MyInterface { myMethod(): void; }",
        language: "typescript",
        requirements: "Implement the interface with a console log in myMethod.",
      };

      const result: ContractResult<PairOutput, AgentError> =
        await pairAgent.generateCode(mockInput);

      expect(result.result).toBeDefined();
      expect(result.error).toBeUndefined();
      expect(result.result?.generatedCode).toContain(
        "class MyClass implements MyInterface"
      );
      expect(result.result?.generatedCode).toContain("myMethod(): void");
      expect(result.result?.generatedCode).toContain("console.log");
    });

    test("should return an AgentError if contract is missing", async () => {
      const mockErrorInput: PairInput = {
        requestingAgentId: mockRequestingAgentId,
        contract: "", // Missing contract
        language: "typescript",
      };

      const result: ContractResult<PairOutput, AgentError> =
        await pairAgent.generateCode(mockErrorInput);

      expect(result.error).toBeDefined();
      expect(result.result).toBeUndefined();
      expect(result.error?.agentId).toEqual(mockPairAgentId);
      expect(result.error?.requestingAgentId).toEqual(mockRequestingAgentId);
      expect(result.error?.category).toEqual(ErrorCategory.INVALID_INPUT);
      expect(result.error?.message).toContain(
        "Contract definition is required"
      );
    });

    test("should return an AgentError if language is missing", async () => {
      const mockErrorInput: PairInput = {
        requestingAgentId: mockRequestingAgentId,
        contract: "interface MyInterface { myMethod(): void; }",
        language: "", // Missing language
      };

      const result: ContractResult<PairOutput, AgentError> =
        await pairAgent.generateCode(mockErrorInput);

      expect(result.error).toBeDefined();
      expect(result.result).toBeUndefined();
      expect(result.error?.agentId).toEqual(mockPairAgentId);
      expect(result.error?.requestingAgentId).toEqual(mockRequestingAgentId);
      expect(result.error?.category).toEqual(ErrorCategory.INVALID_INPUT);
      expect(result.error?.message).toContain("Target language is required");
    });
  });
});
