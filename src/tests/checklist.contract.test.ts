// filepath: c:\Users\thump\SeemsToMe\src\tests\checklist.contract.test.ts
/**
 * PURPOSE: Test contract conformance for the Checklist Agent
 * DATA FLOW: Test ↔ Checklist Agent
 * INTEGRATION POINTS: Checklist Contract
 * CONTRACT VERSION: v1
 * ERROR HANDLING: Tests various error cases defined in the contract
 */

import { ChecklistAgent } from "../agents/checklist.agent";
import {
  ChecklistCategory,
  ChecklistContract,
  ChecklistRequest,
  ChecklistResponse, // Added for type assertion
  ReportOutput, // Added for type assertion
} from "../contracts/checklist.contract";
import { AgentError, AgentId } from "../contracts/types"; // Added AgentError and AgentId

describe("Checklist Contract Conformance", () => {
  let checklist: ChecklistContract;
  const requestingAgentId: AgentId = "test-rig-checklist" as AgentId;

  beforeEach(() => {
    // Create a fresh instance for each test
    checklist = new ChecklistAgent();
  });

  describe("getCategories", () => {
    test("should return all available categories", async () => {
      const result = await checklist.getCategories();
      expect(result.success).toBe(true);
      if (!result.success) return; // Type guard
      const categories = result.result;
      expect(categories).toBeInstanceOf(Array);
      expect(categories.length).toBeGreaterThan(0);
      expect(categories).toContain(ChecklistCategory.CONTRACT_DEFINITION);
      expect(categories).toContain(ChecklistCategory.DOCUMENTATION);
    });
  });

  describe("checkCompliance", () => {
    test("should check compliance for a target path", async () => {
      const request: ChecklistRequest = {
        targetPath: "/test/path",
        requestingAgentId,
      };

      const result = await checklist.checkCompliance(request);
      expect(result.success).toBe(true);
      if (!result.success) return; // Type guard
      const response = result.result as ChecklistResponse; // Type assertion
      expect(response.targetPath).toBe(request.targetPath);
      expect(response.items).toBeInstanceOf(Array);
      expect(response.summary).toBeDefined();
      expect(response.summary.overallStatus).toBeDefined();
    });

    test("should filter by categories when specified", async () => {
      const categoriesToFilter = [
        ChecklistCategory.CONTRACT_DEFINITION,
        ChecklistCategory.TESTING,
      ];

      const request: ChecklistRequest = {
        targetPath: "/test/path",
        categories: categoriesToFilter,
        requestingAgentId,
      };

      const result = await checklist.checkCompliance(request);
      expect(result.success).toBe(true);
      if (!result.success) return; // Type guard
      const response = result.result as ChecklistResponse; // Type assertion

      // All items should belong to the requested categories
      response.items.forEach((item: { category: ChecklistCategory }) => {
        expect(categoriesToFilter).toContain(item.category);
      });

      // Should have at least one item per category
      const foundCategories = new Set(
        response.items.map(
          (item: { category: ChecklistCategory }) => item.category
        )
      );
      categoriesToFilter.forEach((category) => {
        expect(foundCategories.has(category)).toBe(true);
      });
    });

    test("should return an error for invalid request (missing targetPath)", async () => {
      const request: any = { requestingAgentId }; // Missing targetPath
      const result = await checklist.checkCompliance(request);
      expect(result.success).toBe(false);
      if (result.success) return; // Type guard
      const error = result.error as AgentError;
      expect(error).toBeDefined();
      expect(error.category).toEqual("INVALID_REQUEST");
      expect(error.agentId).toEqual("checklist-agent");
    });
  });

  describe("generateReport", () => {
    test("should generate a report in markdown format", async () => {
      const targetPath = "/test/path";
      const format = "markdown";

      const result = await checklist.generateReport(
        targetPath,
        format,
        requestingAgentId
      ); // Added requestingAgentId
      expect(result.success).toBe(true);
      if (!result.success) return; // Type guard
      const report = result.result as ReportOutput; // Type assertion
      expect(typeof report).toBe("string");
      expect(report).toContain("SDD Compliance Report");
      expect(report).toContain(targetPath);
    });

    test("should return an error for unsupported formats", async () => {
      const targetPath = "/test/path";
      const format = "unsupported";

      const result = await checklist.generateReport(
        targetPath,
        format,
        requestingAgentId
      ); // Added requestingAgentId
      expect(result.success).toBe(false);
      if (result.success) return; // Type guard
      const error = result.error as AgentError;
      expect(error).toBeDefined();
      expect(error.message).toContain(`Format ${format} not supported yet`);
      expect(error.category).toEqual("INVALID_REQUEST");
      expect(error.agentId).toEqual("checklist-agent");
    });

    test("should return an error for invalid request (missing targetPath)", async () => {
      const format = "markdown";
      const result = await checklist.generateReport(
        undefined as any,
        format,
        requestingAgentId
      ); // Added requestingAgentId
      expect(result.success).toBe(false);
      if (result.success) return; // Type guard
      const error = result.error as AgentError;
      expect(error).toBeDefined();
      expect(error.category).toEqual("INVALID_REQUEST");
      expect(error.agentId).toEqual("checklist-agent");
    });
  });
});
