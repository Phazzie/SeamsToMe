// filepath: c:\Users\thump\SeemsToMe\src\tests\documentation.contract.test.ts
/**
 * PURPOSE: Test contract conformance for the Documentation Agent
 * DATA FLOW: Test ↔ Documentation Agent
 * INTEGRATION POINTS: Documentation Contract
 * CONTRACT VERSION: v1
 * ERROR HANDLING: Tests various error cases defined in the contract
 */

import { DocumentationAgent } from "../agents/documentation.agent";
import {
  DocumentationContract,
  DocumentationFormat,
  DocumentationRequest,
  DocumentationSource,
  DocumentationType,
} from "../contracts/documentation.contract";

describe("Documentation Contract Conformance", () => {
  let documentation: DocumentationContract;

  beforeEach(() => {
    // Create a fresh instance for each test
    documentation = new DocumentationAgent();
  });

  describe("generateDocumentation", () => {
    test("should generate contract documentation in markdown format", async () => {
      const request: DocumentationRequest = {
        docType: DocumentationType.CONTRACT,
        sources: [
          {
            path: "./src/contracts/test.contract.ts",
            type: "FILE",
          },
        ],
        format: DocumentationFormat.MARKDOWN,
        requestingAgentId: "test-agent",
      };
      const result = await documentation.generateDocumentation(request);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.result.content).toBeTruthy();
        expect(result.result.format).toBe(DocumentationFormat.MARKDOWN);
        expect(result.result.metadata).toBeDefined();
        expect(result.result.metadata.docType).toBe(DocumentationType.CONTRACT);
        expect(result.result.metadata.generatedOn).toBeInstanceOf(Date);
      }
    });

    test("should generate seam documentation", async () => {
      const request: DocumentationRequest = {
        docType: DocumentationType.SEAM,
        sources: [
          {
            path: "./src/contracts/test.contract.ts",
            type: "FILE",
          },
        ],
        format: DocumentationFormat.MARKDOWN,
        requestingAgentId: "test-agent",
      };
      const result = await documentation.generateDocumentation(request);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.result.content).toBeTruthy();
        expect(result.result.content).toContain("Seam Documentation");
      }
    });

    test("should generate agent documentation", async () => {
      const request: DocumentationRequest = {
        docType: DocumentationType.AGENT,
        sources: [
          {
            path: "./src/agents/test.agent.ts",
            type: "FILE",
          },
        ],
        format: DocumentationFormat.MARKDOWN,
        requestingAgentId: "test-agent",
      };
      const result = await documentation.generateDocumentation(request);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.result.content).toBeTruthy();
        expect(result.result.content).toContain("Agent Documentation");
      }
    });
  });

  describe("validateDocumentation", () => {
    test("should validate documentation against sources", async () => {
      const docPath = "./docs/test.md";
      const sources: DocumentationSource[] = [
        {
          path: "./src/contracts/test.contract.ts",
          type: "FILE",
        },
      ];
      const result = await documentation.validateDocumentation(
        docPath,
        sources
      );

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.result.isValid).toBeDefined();
        expect(result.result.issues).toBeInstanceOf(Array);
      }
    });
  });

  describe("updateDocumentation", () => {
    test("should update existing documentation", async () => {
      const docPath = "./docs/test.md";
      const sources: DocumentationSource[] = [
        {
          path: "./src/contracts/test.contract.ts",
          type: "FILE",
        },
      ];

      const preserveSections = ["Overview", "Usage Examples"];
      const result = await documentation.updateDocumentation(
        docPath,
        sources,
        preserveSections
      );

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.result.content).toBeTruthy();
        expect(result.result.format).toBeDefined();
        expect(result.result.metadata).toBeDefined();
        expect(result.result.metadata.generatedOn).toBeInstanceOf(Date);
      }
    });
  });

  describe("extractBlueprintComments", () => {
    test("should extract blueprint comments from source files", async () => {
      const sourcePaths = ["./src/contracts/test.contract.ts"];
      const result = await documentation.extractBlueprintComments(sourcePaths);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.result).toBeInstanceOf(Array);
        expect(result.result.length).toBeGreaterThan(0);
        const firstFile = result.result[0];
        expect(firstFile.path).toBe(sourcePaths[0]);
        expect(firstFile.comments).toBeInstanceOf(Array);
        expect(firstFile.comments.length).toBeGreaterThan(0);

        const firstComment = firstFile.comments[0];
        expect(firstComment.content).toBeTruthy();
        expect(firstComment.location).toBeTruthy();
        expect(firstComment.type).toBeDefined();
      }
    });
  });
});
