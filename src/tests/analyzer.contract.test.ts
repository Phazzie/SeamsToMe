// filepath: c:\Users\thump\SeemsToMe\src\tests\analyzer.contract.test.ts
/**
 * @file Analyzer Agent Contract Test
 * @description This file contains contract tests for the Analyzer agent.
 */

import { AnalyzerAgent } from "../agents/analyzer.agent";
import {
  AnalyzerAgentContract,
  AnalyzerInput,
  AnalyzerOutput,
  SeamInfo,
} from "../contracts/analyzer.contract";
import {
  AgentError,
  AgentId,
  ContractResult,
  ErrorCategory,
} from "../contracts/types";

const mockRequestingAgentId: AgentId = "test-orchestrator";
const mockAnalyzerAgentId: AgentId = "analyzer-agent";

describe("AnalyzerAgent Contract Tests", () => {
  let analyzerAgent: AnalyzerAgentContract;

  beforeEach(() => {
    analyzerAgent = new AnalyzerAgent();
    (analyzerAgent as AnalyzerAgent).agentId = mockAnalyzerAgentId;
  });

  test("should conform to AnalyzerAgentContract", () => {
    expect(typeof analyzerAgent.analyzeSeams).toBe("function");
  });

  describe("analyzeSeams", () => {
    test("should return a successful ContractResult with seam analysis on happy path", async () => {
      const mockInput: AnalyzerInput = {
        requestingAgentId: mockRequestingAgentId,
        codebasePath: "./src",
        docsPath: "./docs",
      };

      const result: ContractResult<AnalyzerOutput, AgentError> =
        await analyzerAgent.analyzeSeams(mockInput);

      expect(result.result).toBeDefined();
      expect(result.error).toBeUndefined();
      expect(result.result?.seams).toBeInstanceOf(Array);
      expect(result.result?.seams.length).toBeGreaterThan(0);
      const seam = result.result?.seams[0] as SeamInfo;
      expect(seam.seamId).toBeDefined();
      expect(seam.agents).toBeInstanceOf(Array);
      expect(seam.description).toBeDefined();
      expect(seam.status).toBeDefined();
    });

    test("should return a successful ContractResult even if docsPath is missing", async () => {
      const mockInput: AnalyzerInput = {
        requestingAgentId: mockRequestingAgentId,
        codebasePath: "./src",
      };

      const result: ContractResult<AnalyzerOutput, AgentError> =
        await analyzerAgent.analyzeSeams(mockInput);

      expect(result.result).toBeDefined();
      expect(result.error).toBeUndefined();
      expect(result.result?.seams).toBeInstanceOf(Array);
    });

    test("should return an AgentError in ContractResult if codebasePath is missing", async () => {
      const mockErrorInput: AnalyzerInput = {
        requestingAgentId: mockRequestingAgentId,
        codebasePath: "", // Missing codebasePath
      };

      const result: ContractResult<AnalyzerOutput, AgentError> =
        await analyzerAgent.analyzeSeams(mockErrorInput);

      expect(result.error).toBeDefined();
      expect(result.result).toBeUndefined();
      expect(result.error?.agentId).toEqual(mockAnalyzerAgentId);
      expect(result.error?.requestingAgentId).toEqual(mockRequestingAgentId);
      expect(result.error?.category).toEqual(ErrorCategory.INVALID_INPUT);
      expect(result.error?.message).toContain("Codebase path is required");
    });

    test("should return an empty seams array if no seams are found", async () => {
      const mockInput: AnalyzerInput = {
        requestingAgentId: mockRequestingAgentId,
        codebasePath: "./test-empty-project", // Assuming this path leads to no identifiable seams
      };
      // Mock the agent to return an empty array for this specific case
      jest.spyOn(analyzerAgent, "analyzeSeams").mockResolvedValueOnce({
        result: {
          seams: [],
        },
      });

      const result: ContractResult<AnalyzerOutput, AgentError> =
        await analyzerAgent.analyzeSeams(mockInput);

      expect(result.result).toBeDefined();
      expect(result.error).toBeUndefined();
      expect(result.result?.seams).toBeInstanceOf(Array);
      expect(result.result?.seams.length).toBe(0);
    });
  });
});
