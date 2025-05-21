// filepath: c:\Users\thump\SeemsToMe\src\tests\quality.contract.test.ts
/**
 * @file Quality Agent Contract Test
 * @description This file contains contract tests for the Quality agent.
 */

import { QualityAgent } from "../agents/quality.agent";
import {
  QualityAgentContract,
  QualityCheckType,
  QualityInput,
  QualityIssue,
  QualityOutput,
} from "../contracts/quality.contract";
import {
  AgentError,
  AgentId,
  ContractResult,
  ErrorCategory,
} from "../contracts/types";

const mockRequestingAgentId: AgentId = "test-orchestrator";
const mockQualityAgentId: AgentId = "quality-agent";

describe("QualityAgent Contract Tests", () => {
  let qualityAgent: QualityAgentContract;

  beforeEach(() => {
    qualityAgent = new QualityAgent();
    (qualityAgent as QualityAgent).agentId = mockQualityAgentId;
  });

  test("should conform to QualityAgentContract", () => {
    expect(typeof qualityAgent.checkQuality).toBe("function");
  });

  describe("checkQuality", () => {
    test("should return a successful ContractResult with quality issues on happy path", async () => {
      const mockInput: QualityInput = {
        requestingAgentId: mockRequestingAgentId,
        targetPath: "./src",
        checkTypes: [
          QualityCheckType.CODE_QUALITY,
          QualityCheckType.SDD_COMPLIANCE,
        ],
      };

      const result: ContractResult<QualityOutput, AgentError> =
        await qualityAgent.checkQuality(mockInput);

      expect(result.result).toBeDefined();
      expect(result.error).toBeUndefined();
      expect(result.result?.issues).toBeInstanceOf(Array);
      // In a real scenario, the stub might return some mock issues or an empty array if quality is perfect.
      // For this test, we'll assume the stub returns a summary and a date.
      expect(result.result?.summary).toContain(
        "Quality check completed for ./src"
      );
      expect(result.result?.checkedOn).toBeInstanceOf(Date);
    });

    test("should return an AgentError in ContractResult if targetPath is missing", async () => {
      const mockErrorInput: QualityInput = {
        requestingAgentId: mockRequestingAgentId,
        targetPath: "", // Missing targetPath
        checkTypes: [QualityCheckType.CODE_QUALITY],
      };

      const result: ContractResult<QualityOutput, AgentError> =
        await qualityAgent.checkQuality(mockErrorInput);

      expect(result.error).toBeDefined();
      expect(result.result).toBeUndefined();
      expect(result.error?.agentId).toEqual(mockQualityAgentId);
      expect(result.error?.requestingAgentId).toEqual(mockRequestingAgentId);
      expect(result.error?.category).toEqual(ErrorCategory.INVALID_INPUT);
      expect(result.error?.message).toContain("Target path is required");
    });

    test("should return an AgentError in ContractResult if checkTypes is empty", async () => {
      const mockErrorInput: QualityInput = {
        requestingAgentId: mockRequestingAgentId,
        targetPath: "./src",
        checkTypes: [], // Empty checkTypes
      };

      const result: ContractResult<QualityOutput, AgentError> =
        await qualityAgent.checkQuality(mockErrorInput);

      expect(result.error).toBeDefined();
      expect(result.result).toBeUndefined();
      expect(result.error?.agentId).toEqual(mockQualityAgentId);
      expect(result.error?.requestingAgentId).toEqual(mockRequestingAgentId);
      expect(result.error?.category).toEqual(ErrorCategory.INVALID_INPUT);
      expect(result.error?.message).toContain("Check types are required");
    });

    test("should return issues if quality problems are found", async () => {
      const mockInput: QualityInput = {
        requestingAgentId: mockRequestingAgentId,
        targetPath: "./src/problematic-file.ts",
        checkTypes: [QualityCheckType.CODE_QUALITY],
      };

      // Mock the agent to return specific issues for this test case
      const mockIssue: QualityIssue = {
        type: QualityCheckType.CODE_QUALITY,
        message: "Variable declared but never used",
        severity: "WARNING",
        location: "./src/problematic-file.ts:10",
        suggestion: "Remove unused variable or use it.",
      };
      jest.spyOn(qualityAgent, "checkQuality").mockResolvedValueOnce({
        result: {
          issues: [mockIssue],
          summary: "Quality check completed with 1 issue.",
          checkedOn: new Date(),
        },
      });

      const result: ContractResult<QualityOutput, AgentError> =
        await qualityAgent.checkQuality(mockInput);

      expect(result.result).toBeDefined();
      expect(result.error).toBeUndefined();
      expect(result.result?.issues).toBeInstanceOf(Array);
      expect(result.result?.issues.length).toBe(1);
      expect(result.result?.issues[0]).toEqual(mockIssue);
    });
  });
});
