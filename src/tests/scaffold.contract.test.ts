// filepath: c:\Users\thump\SeemsToMe\src\tests\scaffold.contract.test.ts
/**
 * @file Scaffold Agent Contract Test
 * @description This file contains contract tests for the Scaffold agent.
 */

import { ScaffoldAgent } from "../agents/scaffold.agent";
import {
  ScaffoldInput,
  ScaffoldOutput,
  StubAgentContract,
  StubFile,
  StubFormat,
  ValidateStubsInput,
  ValidateStubsOutput,
} from "../contracts/scaffold.contract";
import {
  AgentError,
  AgentId,
  ContractResult,
  ErrorCategory,
} from "../contracts/types";

const mockRequestingAgentId: AgentId = "test-orchestrator";
const mockScaffoldAgentId: AgentId = "scaffold-agent"; // Used for expected error.agentId

describe("ScaffoldAgent Contract Tests", () => {
  let scaffoldAgent: StubAgentContract;

  beforeEach(() => {
    scaffoldAgent = new ScaffoldAgent();
    // Removed: (scaffoldAgent as ScaffoldAgent).agentId = mockScaffoldAgentId;
    // Agent ID should be handled by the agent internally if needed for error reporting
  });

  test("should conform to StubAgentContract", () => {
    expect(typeof scaffoldAgent.generateScaffold).toBe("function");
    expect(typeof scaffoldAgent.validateStubs).toBe("function");
  });

  describe("generateScaffold", () => {
    test("should return a successful ContractResult with scaffold files on happy path", async () => {
      const mockInput: ScaffoldInput = {
        requestingAgentId: mockRequestingAgentId,
        designDoc: "Design for a new UI component",
        targetPath: "./src/components/new-component",
        format: StubFormat.TYPESCRIPT,
      };

      const result: ContractResult<ScaffoldOutput, AgentError> =
        await scaffoldAgent.generateScaffold(mockInput);

      expect(result.result).toBeDefined();
      expect(result.error).toBeUndefined();
      expect(result.result?.files).toBeInstanceOf(Array);
      expect(result.result?.files.length).toBeGreaterThan(0);
      expect(result.result?.files[0].path).toContain("new-component");
      expect(result.result?.files[0].format).toEqual(StubFormat.TYPESCRIPT);
    });

    test("should return an AgentError in ContractResult if designDoc is missing", async () => {
      const mockErrorInput: ScaffoldInput = {
        requestingAgentId: mockRequestingAgentId,
        designDoc: "", // Missing designDoc
        targetPath: "./src/components/new-component",
        format: StubFormat.TYPESCRIPT,
      };

      const result: ContractResult<ScaffoldOutput, AgentError> =
        await scaffoldAgent.generateScaffold(mockErrorInput);

      expect(result.error).toBeDefined();
      expect(result.result).toBeUndefined();
      expect(result.error?.agentId).toEqual(mockScaffoldAgentId); // Assuming agent sets this ID
      // expect(result.error?.requestingAgentId).toEqual(mockRequestingAgentId); // AgentError does not have requestingAgentId
      expect(result.error?.category).toEqual(ErrorCategory.INVALID_REQUEST); // Changed from INVALID_INPUT
      expect(result.error?.message).toContain("Design document is required");
    });
  });

  describe("validateStubs", () => {
    test("should return a successful ContractResult with validation status on happy path", async () => {
      const mockFiles: StubFile[] = [
        {
          path: "./src/components/new-component/index.ts",
          content: "export class NewComponent {}",
          format: StubFormat.TYPESCRIPT,
        },
      ];
      const mockInput: ValidateStubsInput = {
        requestingAgentId: mockRequestingAgentId,
        files: mockFiles,
      };

      const result: ContractResult<ValidateStubsOutput, AgentError> =
        await scaffoldAgent.validateStubs(mockInput);

      expect(result.result).toBeDefined();
      expect(result.error).toBeUndefined();
      expect(result.result?.isValid).toBe(true);
      expect(result.result?.issues).toBeInstanceOf(Array);
      expect(result.result?.issues?.length).toBe(0); // Added optional chaining for safety
    });

    test("should return an AgentError in ContractResult if files array is empty", async () => {
      const mockErrorInput: ValidateStubsInput = {
        requestingAgentId: mockRequestingAgentId,
        files: [], // Empty files array
      };

      const result: ContractResult<ValidateStubsOutput, AgentError> =
        await scaffoldAgent.validateStubs(mockErrorInput);

      expect(result.error).toBeDefined();
      expect(result.result).toBeUndefined();
      expect(result.error?.agentId).toEqual(mockScaffoldAgentId); // Assuming agent sets this ID
      // expect(result.error?.requestingAgentId).toEqual(mockRequestingAgentId); // AgentError does not have requestingAgentId
      expect(result.error?.category).toEqual(ErrorCategory.INVALID_REQUEST); // Changed from INVALID_INPUT
      expect(result.error?.message).toContain("Files to validate are required");
    });

    test("should return validation issues for invalid stubs", async () => {
      const mockInvalidFiles: StubFile[] = [
        {
          path: "./src/components/invalid-component/index.ts",
          content: "export class InvalidComponent { missingBracket",
          format: StubFormat.TYPESCRIPT,
        },
      ];
      const mockInput: ValidateStubsInput = {
        requestingAgentId: mockRequestingAgentId,
        files: mockInvalidFiles,
      };

      const result: ContractResult<ValidateStubsOutput, AgentError> =
        await scaffoldAgent.validateStubs(mockInput);

      expect(result.result).toBeDefined();
      expect(result.error).toBeUndefined();
      expect(result.result?.isValid).toBe(false);
      expect(result.result?.issues).toBeInstanceOf(Array);
      expect(result.result?.issues?.length).toBeGreaterThan(0); // Added optional chaining
      expect(result.result?.issues?.[0].severity).toEqual("ERROR"); // Added optional chaining
      expect(result.result?.issues?.[0].message).toContain("Syntax error"); // Or similar mock message, added optional chaining
    });
  });
});
