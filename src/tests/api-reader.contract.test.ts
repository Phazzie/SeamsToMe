/**
 * @file API Reader Agent Contract Test
 * @description This file contains contract tests for the API Doc Reader agent.
 */

import { ApiReaderAgent } from "../agents/api-reader.agent";
import {
  ApiReaderInput,
  ApiReaderOutput,
  IApiReaderAgent,
} from "../contracts/api-reader.contract";
import {
  AgentError,
  AgentId,
  ContractResult,
  ErrorCategory,
} from "../contracts/types";

const mockRequestingAgentId: AgentId = "test-orchestrator";
const mockApiReaderAgentId: AgentId = "api-reader-agent"; // As defined in the stub

describe("ApiReaderAgent Contract Tests", () => {
  let apiReaderAgent: IApiReaderAgent;

  beforeEach(() => {
    apiReaderAgent = new ApiReaderAgent();
    // No explicit agentId setter in the current stub, but it's good practice if it were needed.
    // (apiReaderAgent as ApiReaderAgent).agentId = mockApiReaderAgentId;
  });

  test("should conform to IApiReaderAgent contract", () => {
    expect(typeof apiReaderAgent.readApiDoc).toBe("function");
  });

  describe("readApiDoc", () => {
    test("should return a successful ContractResult with API summary on happy path (URL)", async () => {
      const mockInput: ApiReaderInput = {
        requestingAgentId: mockRequestingAgentId,
        url: "https://example.com/api/docs",
      };

      const result: ContractResult<ApiReaderOutput, AgentError> =
        await apiReaderAgent.readApiDoc(mockInput);

      // The stub returns a NotImplementedError, so we test for that.
      // When the stub is implemented, these expectations should change.
      expect(result.error).toBeDefined();
      expect(result.result).toBeUndefined();
      expect(result.error?.name).toEqual("NotImplementedError");
      expect(result.error?.agentId).toEqual(mockApiReaderAgentId);
      expect(result.error?.requestingAgentId).toEqual(mockRequestingAgentId);

      // SDD-TODO: Update these expectations when the stub is implemented
      // expect(result.result).toBeDefined();
      // expect(result.error).toBeUndefined();
      // expect(result.result?.title).toEqual("Mock API Doc"); // Based on potential stub success mock
      // expect(result.result?.endpoints).toBeInstanceOf(Array);
      // expect(result.result?.endpoints.length).toBeGreaterThan(0);
    });

    test("should return a successful ContractResult with API summary on happy path (content)", async () => {
      const mockInput: ApiReaderInput = {
        requestingAgentId: mockRequestingAgentId,
        content:
          "openapi: 3.0.0\ninfo:\n  title: Test API\n  version: 1.0.0\npaths:\n  /test:\n    get:\n      summary: Test endpoint",
        format: "OpenAPI",
      };

      const result: ContractResult<ApiReaderOutput, AgentError> =
        await apiReaderAgent.readApiDoc(mockInput);

      // Stub returns NotImplementedError
      expect(result.error).toBeDefined();
      expect(result.result).toBeUndefined();
      expect(result.error?.name).toEqual("NotImplementedError");
      expect(result.error?.agentId).toEqual(mockApiReaderAgentId);

      // SDD-TODO: Update these expectations when the stub is implemented
      // expect(result.result).toBeDefined();
      // expect(result.error).toBeUndefined();
      // expect(result.result?.title).toEqual("Test API");
    });

    test("should return an AgentError if both url and content are missing", async () => {
      const mockErrorInput: ApiReaderInput = {
        requestingAgentId: mockRequestingAgentId,
        // url and content are missing
      };

      const result: ContractResult<ApiReaderOutput, AgentError> =
        await apiReaderAgent.readApiDoc(mockErrorInput);

      expect(result.error).toBeDefined();
      expect(result.result).toBeUndefined();
      expect(result.error?.name).toEqual("NotImplementedError"); // Stub returns this
      expect(result.error?.category).toEqual(ErrorCategory.UNEXPECTED_ERROR); // Stub returns this
      expect(result.error?.agentId).toEqual(mockApiReaderAgentId);
      // Ideal error message for a full implementation:
      // expect(result.error?.message).toContain("Either URL or content must be provided");
    });

    test("should return an AgentError if url is malformed (conceptual test for stub)", async () => {
      const mockErrorInput: ApiReaderInput = {
        requestingAgentId: mockRequestingAgentId,
        url: "not-a-valid-url",
      };

      const result: ContractResult<ApiReaderOutput, AgentError> =
        await apiReaderAgent.readApiDoc(mockErrorInput);

      // The stub doesn't validate the URL, it just returns NotImplementedError.
      // A full implementation would likely return an INVALID_INPUT error.
      expect(result.error).toBeDefined();
      expect(result.result).toBeUndefined();
      expect(result.error?.name).toEqual("NotImplementedError");
      expect(result.error?.category).toEqual(ErrorCategory.UNEXPECTED_ERROR);
      expect(result.error?.agentId).toEqual(mockApiReaderAgentId);
      // Ideal error for a full implementation:
      // expect(result.error?.category).toEqual(ErrorCategory.INVALID_INPUT);
      // expect(result.error?.message).toContain("Invalid URL format");
    });

    test("should return an AgentError if requestingAgentId is missing", async () => {
      const mockErrorInput: ApiReaderInput = {
        requestingAgentId: "" as AgentId, // Missing requestingAgentId
        url: "https://example.com/api/docs",
      };

      const result: ContractResult<ApiReaderOutput, AgentError> =
        await apiReaderAgent.readApiDoc(mockErrorInput);

      expect(result.error).toBeDefined();
      expect(result.result).toBeUndefined();
      expect(result.error?.name).toEqual("NotImplementedError"); // Stub returns this
      expect(result.error?.category).toEqual(ErrorCategory.UNEXPECTED_ERROR); // Stub returns this
      expect(result.error?.agentId).toEqual(mockApiReaderAgentId);
      // The stub includes the requestingAgentId in the error details, even if empty.
      expect(result.error?.details?.requestingAgentId).toEqual("");
      // Ideal error for a full implementation:
      // expect(result.error?.message).toContain("requestingAgentId is required");
    });
  });
});
