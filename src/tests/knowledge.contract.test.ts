/**
 * Knowledge Contract Test
 *
 * Purpose: Tests KnowledgeAgent contract compliance
 * Data Flow: Test data → agent → assertions
 * Integration: Jest test runner
 * Failure Modes: Contract violations, assertion failures
 * Rationale: Ensures agent implements contract correctly
 *
 * SDD: SEAM TEST for KnowledgeAgent
 */

import { KnowledgeAgent } from "../agents/knowledge.agent";
import { 
  KnowledgeDomain, 
  KnowledgeFormat,
  KnowledgeInput,
  StoreKnowledgeInput 
} from "../contracts/knowledge.contract";

describe("KnowledgeAgent Contract Tests", () => {
  let agent: KnowledgeAgent;

  beforeEach(() => {
    agent = new KnowledgeAgent();
  });

  describe("retrieveKnowledge", () => {
    test("should return success with empty results for new agent", async () => {
      const request: KnowledgeInput = {
        query: "test query",
        requestingAgentId: "test-agent",
        format: KnowledgeFormat.TEXT
      };

      const result = await agent.retrieveKnowledge(request);
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.result.items).toEqual([]);
        expect(result.result.totalResults).toBe(0);
        expect(result.result.query).toBe("test query");
        expect(typeof result.result.executionTime).toBe("number");
      }
    });

    test("should filter by domain when specified", async () => {
      const request: KnowledgeInput = {
        query: "test",
        domain: KnowledgeDomain.TECHNICAL,
        requestingAgentId: "test-agent"
      };

      const result = await agent.retrieveKnowledge(request);
      expect(result.success).toBe(true);
    });
  });

  describe("storeKnowledge", () => {
    test("should store knowledge and return ID", async () => {
      const item: StoreKnowledgeInput = {
        content: "Test knowledge content",
        metadata: {
          source: "test-source",
          confidence: 0.9,
          timestamp: new Date(),
          domain: KnowledgeDomain.TECHNICAL,
          tags: ["test"]
        },
        format: KnowledgeFormat.TEXT
      };

      const result = await agent.storeKnowledge(item, "test-agent");
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(typeof result.result).toBe("string");
        expect(result.result).toMatch(/^knowledge-\d+-\d+$/);
      }
    });
  });

  describe("hasKnowledge", () => {
    test("should return false for non-existent knowledge", async () => {
      const result = await agent.hasKnowledge("non-existent query");
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.result).toBe(false);
      }
    });

    test("should return true after storing matching knowledge", async () => {
      // First store some knowledge
      const item: StoreKnowledgeInput = {
        content: "This is a test knowledge item",
        metadata: {
          source: "test-source",
          confidence: 0.9,
          timestamp: new Date(),
          domain: KnowledgeDomain.TECHNICAL
        },
        format: KnowledgeFormat.TEXT
      };

      await agent.storeKnowledge(item, "test-agent");

      // Then check if it exists
      const result = await agent.hasKnowledge("test knowledge");
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.result).toBe(true);
      }
    });
  });

  describe("integration workflow", () => {
    test("should support store -> retrieve -> check workflow", async () => {
      // Store knowledge
      const item: StoreKnowledgeInput = {
        content: "Comprehensive test knowledge for workflow validation",
        metadata: {
          source: "integration-test",
          confidence: 0.95,
          timestamp: new Date(),
          domain: KnowledgeDomain.PROCESS,
          tags: ["workflow", "integration"]
        },
        format: KnowledgeFormat.MARKDOWN
      };

      const storeResult = await agent.storeKnowledge(item, "integration-test-agent");
      expect(storeResult.success).toBe(true);

      // Retrieve knowledge
      const retrieveResult = await agent.retrieveKnowledge({
        query: "workflow",
        domain: KnowledgeDomain.PROCESS,
        requestingAgentId: "integration-test-agent"
      });

      expect(retrieveResult.success).toBe(true);
      if (retrieveResult.success) {
        expect(retrieveResult.result.items.length).toBe(1);
        expect(retrieveResult.result.items[0].content).toContain("workflow validation");
      }

      // Check knowledge exists
      const hasResult = await agent.hasKnowledge("workflow", KnowledgeDomain.PROCESS);
      expect(hasResult.success).toBe(true);
      if (hasResult.success) {
        expect(hasResult.result).toBe(true);
      }
    });
  });
});
