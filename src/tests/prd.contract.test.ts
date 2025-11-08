// filepath: c:\Users\thump\SeemsToMe\src\tests\prd.contract.test.ts
/**
 * @file PRD Agent Contract Test
 * @description This file contains contract tests for the PRD agent.
 */

import { PrdAgent } from "../agents/prd.agent";
import {
  PRDAgentContract, // Changed from IPrdAgentContract
  PRDGenerationRequest, // Changed from PrdAgentRequest
  PRDGenerationResult, // Changed from PrdAgentResponse
  PRDValidationResult, // Added this import
} from "../contracts/prd.contract";
import {
  AgentError,
  AgentId,
  ContractResult,
  ErrorCategory,
} from "../contracts/types";

const mockRequestingAgentId: AgentId = "test-orchestrator";
const mockPrdAgentId: AgentId = "PrdAgent"; // Match the actual agent ID from PrdAgent

describe("PrdAgent Contract Tests", () => {
  let prdAgent: PRDAgentContract; // Changed from IPrdAgentContract

  beforeEach(() => {
    prdAgent = new PrdAgent();
    // Removed: (prdAgent as PrdAgent).agentId = mockPrdAgentId;
    // Agent ID should be handled by the agent internally if needed for error reporting
  });

  test("should conform to PRDAgentContract", () => {
    // Changed from IPrdAgentContract
    expect(typeof prdAgent.generatePRD).toBe("function");
    expect(typeof prdAgent.validatePRD).toBe("function"); // Corrected method name based on prd.contract.ts
  });

  describe("generatePRD", () => {
    test("should return a successful ContractResult with PRD content on happy path", async () => {
      const mockInput: PRDGenerationRequest = {
        requestingAgentId: mockRequestingAgentId,
        // targetAgentId is not part of PRDGenerationRequest in prd.contract.ts
        conversation: "Generate PRD for a new feature: User Authentication", // Changed field name based on PRDGenerationRequest
        format: "MARKDOWN", // Changed field name based on PRDGenerationRequest
        // context is not part of PRDGenerationRequest, requirements is optional
        requirements: [
          "The feature should include login, logout, and password reset.",
        ],
      };

      const result: ContractResult<PRDGenerationResult, AgentError> = // Changed from PrdAgentResponse
        await prdAgent.generatePRD(mockInput);

      expect(result.result).toBeDefined();
      expect(result.error).toBeUndefined();
      // PRDGenerationResult does not have prdAgentId or requestingAgentId directly
      // It has sections, format, generatedOn, wordCount
      expect(result.result?.sections).toBeInstanceOf(Array);
      expect(result.result?.format).toEqual("MARKDOWN");
      // expect(result.result?.content).toContain( // content is not a direct property of PRDGenerationResult
      //   "## Product Requirements Document: User Authentication"
      // );
      // expect(result.result?.status).toEqual("success"); // status is not a property of PRDGenerationResult
    });

    test("should return an AgentError in ContractResult if conversation is missing", async () => {
      const mockErrorInput: PRDGenerationRequest = {
        requestingAgentId: mockRequestingAgentId,
        // targetAgentId is not part of PRDGenerationRequest
        conversation: "", // Missing conversation
        format: "MARKDOWN",
      };

      const result: ContractResult<PRDGenerationResult, AgentError> = // Changed from PrdAgentResponse
        await prdAgent.generatePRD(mockErrorInput);

      expect(result.error).toBeDefined();
      expect(result.result).toBeUndefined();
      expect(result.error?.agentId).toEqual(mockPrdAgentId); // Matches PrdAgent's agentId
      // expect(result.error?.requestingAgentId).toEqual(mockRequestingAgentId); // AgentError does not have requestingAgentId
      expect(result.error?.category).toEqual(ErrorCategory.VALIDATION_ERROR); // BaseAgent pattern
      expect(result.error?.message).toContain(
        "Conversation or requirements must be provided"
      ); // PrdAgent's custom validation message
    });
  });

  describe("validatePRD", () => {
    // Corrected method name based on prd.contract.ts
    test("should return a successful ContractResult with review feedback on happy path", async () => {
      const mockInputPrdContent: string =
        "## Product Requirements Document: User Authentication\n...";
      // reviewCriteria is not part of validatePRD in prd.contract.ts

      const result: ContractResult<PRDValidationResult, AgentError> = // Corrected type based on prd.contract.ts
        await prdAgent.validatePRD(mockInputPrdContent);

      expect(result.result).toBeDefined();
      expect(result.error).toBeUndefined();
      expect(result.result?.isValid).toBe(true);
      // PRDValidationResult does not have prdAgentId or requestingAgentId directly
      // expect(result.result?.content).toContain("PRD Review Feedback:"); // No content field in PRDValidationResult
      // expect(result.result?.status).toEqual("success"); // No status field
    });

    test("should return an AgentError in ContractResult if prdContent is missing", async () => {
      const mockErrorInputPrdContent: string = ""; // Missing prdContent

      const result: ContractResult<PRDValidationResult, AgentError> = // Corrected type
        await prdAgent.validatePRD(mockErrorInputPrdContent);

      expect(result.error).toBeDefined();
      expect(result.result).toBeUndefined();
      expect(result.error?.agentId).toEqual(mockPrdAgentId); // Matches PrdAgent's agentId
      // expect(result.error?.requestingAgentId).toEqual(mockRequestingAgentId); // AgentError does not have requestingAgentId
      expect(result.error?.category).toEqual(ErrorCategory.VALIDATION_ERROR); // BaseAgent pattern
      expect(result.error?.message).toContain(
        "prdContent cannot be empty" // BaseAgent validation message
      );
    });
  });
});
