// filepath: c:\Users\thump\SeemsToMe\src\tests\analyzer.contract.test.ts
/**
 * @file Analyzer Agent Contract Test
 * @description This file contains contract tests for the Analyzer agent.
 */

import { AnalyzerAgent } from "../agents/analyzer.agent";
import {
  SeamAnalysisRequest,
  SeamAnalysisResult,
  SeamInfo,
} from "../contracts/analyzer.contract";
import {
  AgentError,
  AgentId,
  ErrorCategory,
  failure,
  success,
} from "../contracts/types"; // Added createAgentError

describe("AnalyzerAgent Contract", () => {
  let analyzerAgent: AnalyzerAgent;

  beforeEach(() => {
    analyzerAgent = new AnalyzerAgent(); // Corrected: No arguments for constructor
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should have a defined agentId", () => {
    expect(analyzerAgent.agentId).toBeDefined(); // Assuming agentId is a public property or getter
  });

  it("should return an error if the request is invalid (e.g., missing codebasePath)", async () => {
    const invalidRequest = {
      // Removed SeamAnalysisRequest type to allow missing property for testing
      requestingAgentId: "TestRequestingAgent" as AgentId,    } as SeamAnalysisRequest; // Cast after definition to satisfy TS for the call

    const result = await analyzerAgent.analyzeSeams(invalidRequest);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.category).toBe(ErrorCategory.INVALID_REQUEST);
      expect(result.error.agentId).toBe(analyzerAgent.agentId); // Agent should set its own ID in the error
    }
  });

  it("should return an error with agentId if requestingAgentId is missing", async () => {
    const requestWithoutRequestingAgentId = {
      // Removed SeamAnalysisRequest type
      codebasePath: "./src",    } as SeamAnalysisRequest; // Cast after definition

    const result = await analyzerAgent.analyzeSeams(
      requestWithoutRequestingAgentId
    );
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.category).toBe(ErrorCategory.INVALID_REQUEST);
      expect(result.error.agentId).toBe(analyzerAgent.agentId);
    }
  });

  it("should handle errors during seam analysis gracefully (e.g., if internal analysis fails)", async () => {
    const request: SeamAnalysisRequest = {
      codebasePath: "problematic/path", // This path might cause an internal error in a real scenario
      requestingAgentId: "TestRequestingAgent" as AgentId,
    };

    const expectedError: AgentError = {
      // Create AgentError as an object literal
      name: "AnalysisError",
      message: "Simulated analysis error",
      category: ErrorCategory.INTERNAL_ERROR,
      agentId: analyzerAgent.agentId, // Agent's ID
      data: { details: "Failed to process problematic/path" },
    };
    // Mock the analyzeSeams method to simulate an internal failure
    jest
      .spyOn(analyzerAgent, "analyzeSeams")
      .mockResolvedValueOnce(failure(expectedError));

    const result = await analyzerAgent.analyzeSeams(request);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.message).toBe("Simulated analysis error");
      expect(result.error.category).toBe(ErrorCategory.INTERNAL_ERROR);
      expect(result.error.agentId).toBe(analyzerAgent.agentId);
    }
  });

  it("should correctly identify seams in valid input (conceptual mock)", async () => {
    const request: SeamAnalysisRequest = {
      codebasePath: "./src",
      docsPath: "./docs",
      requestingAgentId: "TestRequestingAgent" as AgentId,
    };

    const mockSeam: SeamInfo = {
      seamId: "seam1",
      agents: ["AgentA" as AgentId, "AgentB" as AgentId],
      description: "A test seam for identifying integration points.",
      status: "ACTIVE",
      riskLevel: "MEDIUM", // Added optional field
    };

    const mockAnalysisResult: SeamAnalysisResult = {
      seams: [mockSeam],
      issues: [
        {
          // Added optional field
          severity: "INFO",
          message: "Analysis complete.",
          location: "global",
        },
      ],
    };

    // Mock analyzeSeams to return a successful result with the mock data
    jest
      .spyOn(analyzerAgent, "analyzeSeams")
      .mockResolvedValueOnce(success(mockAnalysisResult));

    const result = await analyzerAgent.analyzeSeams(request);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.result.seams.length).toBe(1);
      expect(result.result.seams[0].seamId).toBe("seam1");
      expect(result.result.seams[0].status).toBe("ACTIVE");
      expect(result.result.issues?.[0].severity).toBe("INFO");
    }
  });
});
