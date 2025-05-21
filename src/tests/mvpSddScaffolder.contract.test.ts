// TEST_SUITE_VERSION: 0.1.0
// TARGET_AGENT_CONTRACT_VERSION: 0.1.0

import * as fs from "fs/promises"; // Added for mocking
import * as path from "path"; // Import path for robust path construction
import { MVPSddScaffolderAgent } from "../agents/mvpSddScaffolder.agent";
import {
  IMVPSddScaffolderAgent,
  MVPSddScaffoldOutput,
  MVPSddScaffoldRequest,
  OverwritePolicy,
  SddComponentType,
} from "../contracts/mvpSddScaffolder.contract";
import {
  AgentError,
  AgentId,
  ContractResult,
  ErrorCategory,
} from "../contracts/types";

// Mock fs module
jest.mock("fs/promises");

// Mock AgentId for testing purposes
const mockRequestingAgentId: AgentId = "mock-requesting-agent";

/**
 * @group MVPSddScaffolderAgentContractTests
 * @description Contract tests for the MVPSddScaffolderAgent.
 * These tests verify that the agent's implementation correctly adheres to its contract.
 */
describe("MVPSddScaffolderAgent Contract Tests", () => {
  let agent: IMVPSddScaffolderAgent;
  // Explicitly type the mocked fs functions
  let mockStat: jest.MockedFunction<typeof fs.stat>;
  let mockWriteFile: jest.MockedFunction<typeof fs.writeFile>;
  let mockReadFile: jest.MockedFunction<typeof fs.readFile>;
  let mockMkdir: jest.MockedFunction<typeof fs.mkdir>;

  beforeEach(() => {
    agent = new MVPSddScaffolderAgent();
    // Assign mocked functions before each test
    mockStat = fs.stat as jest.MockedFunction<typeof fs.stat>;
    mockWriteFile = fs.writeFile as jest.MockedFunction<typeof fs.writeFile>;
    mockReadFile = fs.readFile as jest.MockedFunction<typeof fs.readFile>;
    mockMkdir = fs.mkdir as jest.MockedFunction<typeof fs.mkdir>;

    // Default mock implementations
    mockMkdir.mockResolvedValue(undefined); // Default mkdir to success
    mockReadFile.mockResolvedValue(
      "template content {{componentName}} {{sddComponentName}}"
    ); // Default readFile
    mockWriteFile.mockResolvedValue(undefined); // Default writeFile to success
    mockStat.mockRejectedValue({ code: "ENOENT" }); // Default stat to file not found
  });

  afterEach(() => {
    jest.clearAllMocks(); // Clear mocks after each test
  });

  /**
   * @test should generate basic agent and contract files for a valid request
   * @description Verifies that `generateSddScaffold` successfully returns information
   * about conceptually created agent and contract files when sddComponentType is 'agent'.
   * It also checks the content of the generated files.
   */
  it("should generate basic agent and contract files for a valid request when sddComponentType is 'agent'", async () => {
    const componentName = "MyNewComponent";
    const targetDirectory = "./src/sandbox";
    const request: MVPSddScaffoldRequest = {
      requestingAgentId: mockRequestingAgentId,
      componentName: componentName,
      sddComponentType: SddComponentType.AGENT,
      targetDirectory: targetDirectory,
      templateVariables: { customVar: "testValue" },
    };

    const result: ContractResult<MVPSddScaffoldOutput, AgentError> =
      await agent.generateSddScaffold(request);

    expect(result.success).toBe(true);
    expect(result.error).toBeUndefined();
    expect(result.result).toBeDefined();

    const output = result.result as MVPSddScaffoldOutput;
    expect(output.scaffolderAgentId).toEqual("MVPSddScaffolderAgent");
    expect(output.overallStatus).toEqual("success");
    expect(output.summaryMessage).toContain(
      `Successfully scaffolded basic agent and contract files for ${componentName}`
    );

    // Construct expected paths using path.join for consistency
    const expectedComponentDir = path.join(
      targetDirectory,
      componentName.toLowerCase()
    );
    const expectedAgentFilePath = path.join(
      expectedComponentDir,
      `${componentName}.agent.ts`
    );
    const expectedContractFilePath = path.join(
      expectedComponentDir,
      `${componentName}.contract.ts`
    );

    // Verify generatedFiles array (conceptual paths)
    expect(output.generatedFiles).toHaveLength(2);
    expect(output.generatedFiles).toContain(expectedAgentFilePath);
    expect(output.generatedFiles).toContain(expectedContractFilePath);

    // Verify generatedFileContents
    expect(output.generatedFileContents).toBeDefined();
    expect(output.generatedFileContents).toHaveLength(2);

    const agentFileContentDetail = output.generatedFileContents?.find(
      (f) => f.filePath === expectedAgentFilePath
    );
    const contractFileContentDetail = output.generatedFileContents?.find(
      (f) => f.filePath === expectedContractFilePath
    );

    expect(agentFileContentDetail).toBeDefined();
    expect(agentFileContentDetail?.content).toContain(
      `export class ${componentName}Agent`
    );
    expect(agentFileContentDetail?.content).toContain(
      `// Placeholder for ${componentName}Agent`
    );
    expect(agentFileContentDetail?.content).toContain(componentName);
    expect(agentFileContentDetail?.content).toContain("TestValueCustom");

    expect(contractFileContentDetail).toBeDefined();
    expect(contractFileContentDetail?.content).toContain(
      `export interface I${componentName}Agent`
    );
    expect(contractFileContentDetail?.content).toContain(
      `// Contract for ${componentName}`
    );
    expect(contractFileContentDetail?.content).toContain(componentName);
    expect(contractFileContentDetail?.content).toContain("TestValueCustom");
  });

  /**
   * @test should generate agent, contract, and test files when sddComponentType is "full-agent-set"
   * @description Verifies that `generateSddScaffold` successfully returns information
   * about conceptually created agent, contract, and test files when sddComponentType is 'full-agent-set'.
   * It also checks the content of the generated files.
   */
  it('should generate agent, contract, and test files when sddComponentType is "full-agent-set"', async () => {
    const componentName = "MyFullSetComponent";
    const targetDirectory = "./src/sandbox-full";
    const request: MVPSddScaffoldRequest = {
      requestingAgentId: mockRequestingAgentId,
      componentName: componentName,
      sddComponentType: SddComponentType.FULL_AGENT_SET,
      targetDirectory: targetDirectory,
    };

    const result: ContractResult<MVPSddScaffoldOutput, AgentError> =
      await agent.generateSddScaffold(request);

    expect(result.success).toBe(true);
    expect(result.error).toBeUndefined();
    expect(result.result).toBeDefined();

    const output = result.result as MVPSddScaffoldOutput;
    expect(output.scaffolderAgentId).toEqual("MVPSddScaffolderAgent");
    expect(output.overallStatus).toEqual("success");
    expect(output.summaryMessage).toContain(
      `Successfully scaffolded full agent set for ${componentName}`
    );

    const expectedComponentDir = path.join(
      targetDirectory,
      componentName.toLowerCase()
    );
    const expectedAgentFilePath = path.join(
      expectedComponentDir,
      `${componentName}.agent.ts`
    );
    const expectedContractFilePath = path.join(
      expectedComponentDir,
      `${componentName}.contract.ts`
    );
    const expectedTestFilePath = path.join(
      expectedComponentDir,
      `${componentName}.contract.test.ts`
    );

    expect(output.generatedFiles).toHaveLength(3);
    expect(output.generatedFiles).toContain(expectedAgentFilePath);
    expect(output.generatedFiles).toContain(expectedContractFilePath);
    expect(output.generatedFiles).toContain(expectedTestFilePath);

    expect(output.generatedFileContents).toBeDefined();
    expect(output.generatedFileContents).toHaveLength(3);

    const agentContent = output.generatedFileContents?.find(
      (f) => f.filePath === expectedAgentFilePath
    );
    const contractContent = output.generatedFileContents?.find(
      (f) => f.filePath === expectedContractFilePath
    );
    const testContent = output.generatedFileContents?.find(
      (f) => f.filePath === expectedTestFilePath
    );

    expect(agentContent).toBeDefined();
    expect(agentContent?.content).toContain(
      `export class ${componentName}Agent`
    );
    expect(agentContent?.content).toContain(componentName);

    expect(contractContent).toBeDefined();
    expect(contractContent?.content).toContain(
      `export interface I${componentName}Agent`
    );
    expect(contractContent?.content).toContain(componentName);

    expect(testContent).toBeDefined();
    expect(testContent?.content).toContain(
      `describe(\"${componentName} Contract Tests\"`
    );
    expect(testContent?.content).toContain(`I${componentName}Agent`);
    expect(testContent?.content).toContain(componentName);
  });

  /**
   * @test should generate a contract file when sddComponentType is "contract"
   * @description Verifies that `generateSddScaffold` successfully returns information
   * about a conceptually created contract file when sddComponentType is 'contract'.
   * It also checks the content of the generated file.
   */
  it('should generate a contract file when sddComponentType is "contract"', async () => {
    const componentName = "MyContractOnlyComponent";
    const targetDirectory = "./src/sandbox-contract";
    const request: MVPSddScaffoldRequest = {
      requestingAgentId: mockRequestingAgentId,
      componentName: componentName,
      sddComponentType: SddComponentType.CONTRACT,
      targetDirectory: targetDirectory,
    };

    const result: ContractResult<MVPSddScaffoldOutput, AgentError> =
      await agent.generateSddScaffold(request);

    expect(result.success).toBe(true);
    expect(result.error).toBeUndefined();
    expect(result.result).toBeDefined();

    const output = result.result as MVPSddScaffoldOutput;
    expect(output.scaffolderAgentId).toEqual("MVPSddScaffolderAgent");
    expect(output.overallStatus).toEqual("success");
    expect(output.summaryMessage).toContain(
      `Successfully scaffolded contract file for ${componentName}`
    );

    const expectedComponentDir = path.join(
      targetDirectory,
      componentName.toLowerCase()
    );
    const expectedContractFilePath = path.join(
      expectedComponentDir,
      `${componentName}.contract.ts`
    );

    expect(output.generatedFiles).toHaveLength(1);
    expect(output.generatedFiles).toContain(expectedContractFilePath);

    expect(output.generatedFileContents).toBeDefined();
    expect(output.generatedFileContents).toHaveLength(1);
    const contractContent = output.generatedFileContents?.find(
      (f) => f.filePath === expectedContractFilePath
    );
    expect(contractContent).toBeDefined();
    expect(contractContent?.content).toContain(
      `export interface I${componentName}Agent`
    );
    expect(contractContent?.content).toContain(componentName);
  });

  /**
   * @test should generate a test file when sddComponentType is "test"
   * @description Verifies that `generateSddScaffold` successfully returns information
   * about a conceptually created contract test file when sddComponentType is 'test'.
   * It also checks the content of the generated file.
   */
  it('should generate a test file when sddComponentType is "test"', async () => {
    const componentName = "MyTestOnlyComponent";
    const targetDirectory = "./src/sandbox-test";
    const request: MVPSddScaffoldRequest = {
      requestingAgentId: mockRequestingAgentId,
      componentName: componentName,
      sddComponentType: SddComponentType.TEST,
      targetDirectory: targetDirectory,
    };

    const result: ContractResult<MVPSddScaffoldOutput, AgentError> =
      await agent.generateSddScaffold(request);

    expect(result.success).toBe(true);
    expect(result.error).toBeUndefined();
    expect(result.result).toBeDefined();

    const output = result.result as MVPSddScaffoldOutput;
    expect(output.scaffolderAgentId).toEqual("MVPSddScaffolderAgent");
    expect(output.overallStatus).toEqual("success");
    expect(output.summaryMessage).toContain(
      `Successfully scaffolded test file for ${componentName}`
    );
    const expectedComponentDir = path.join(
      targetDirectory,
      componentName.toLowerCase()
    );
    const expectedTestFilePath = path.join(
      expectedComponentDir,
      `${componentName}.contract.test.ts`
    );

    expect(output.generatedFiles).toHaveLength(1);
    expect(output.generatedFiles).toContain(expectedTestFilePath);

    expect(output.generatedFileContents).toBeDefined();
    expect(output.generatedFileContents).toHaveLength(1);
    const testContent = output.generatedFileContents?.find(
      (f) => f.filePath === expectedTestFilePath
    );
    expect(testContent).toBeDefined();
    expect(testContent?.content).toContain(
      `describe(\"${componentName} Contract Tests\"`
    );
    expect(testContent?.content).toContain(`I${componentName}Agent`);
    expect(testContent?.content).toContain(componentName);
  });

  /**
   * @test should return an error if componentName is empty
   * @description Verifies that `generateSddScaffold` returns an error when componentName is empty.
   */
  it("should return an error if componentName is empty", async () => {
    const request: MVPSddScaffoldRequest = {
      requestingAgentId: mockRequestingAgentId,
      componentName: "", // Empty component name
      sddComponentType: SddComponentType.AGENT,
      targetDirectory: "./src/sandbox",
    };

    const result: ContractResult<MVPSddScaffoldOutput, AgentError> =
      await agent.generateSddScaffold(request);

    expect(result.success).toBe(false);
    expect(result.result).toBeUndefined();
    expect(result.error).toBeDefined();
    expect(result.error?.category).toEqual(ErrorCategory.INVALID_REQUEST); // Corrected to INVALID_REQUEST
    expect(result.error?.message).toContain("Component name cannot be empty");
  });

  /**
   * @test should return an error if targetDirectory is empty
   * @description Verifies that `generateSddScaffold` returns an error when targetDirectory is empty.
   */
  it("should return an error if targetDirectory is empty", async () => {
    const request: MVPSddScaffoldRequest = {
      requestingAgentId: mockRequestingAgentId,
      componentName: "MyComponent",
      sddComponentType: SddComponentType.AGENT,
      targetDirectory: "", // Empty target directory
    };

    const result: ContractResult<MVPSddScaffoldOutput, AgentError> =
      await agent.generateSddScaffold(request);

    expect(result.success).toBe(false);
    expect(result.result).toBeUndefined();
    expect(result.error).toBeDefined();
    expect(result.error?.category).toEqual(ErrorCategory.INVALID_REQUEST); // Corrected to INVALID_REQUEST
    expect(result.error?.message).toContain("Target directory cannot be empty");
  });

  /**
   * @test should return an error for an unknown sddComponentType
   * @description Verifies that `generateSddScaffold` returns an error for an unknown sddComponentType.
   */
  it("should return an error for an unknown sddComponentType", async () => {
    const request: MVPSddScaffoldRequest = {
      requestingAgentId: mockRequestingAgentId,
      componentName: "MyComponent",
      sddComponentType: "unknown-type" as SddComponentType, // Invalid type
      targetDirectory: "./src/sandbox",
    };

    const result: ContractResult<MVPSddScaffoldOutput, AgentError> =
      await agent.generateSddScaffold(request);

    expect(result.success).toBe(false);
    expect(result.result).toBeUndefined();
    expect(result.error).toBeDefined();
    expect(result.error?.category).toEqual(ErrorCategory.INVALID_REQUEST); // Corrected to INVALID_REQUEST
    expect(result.error?.message).toContain(
      "Unknown SDD component type: unknown-type"
    );
  });

  /**
   * @test should correctly use and transform templateVariables
   * @description Verifies that templateVariables are correctly applied and transformed (e.g., to PascalCase).
   */
  it("should correctly use and transform templateVariables", async () => {
    const componentName = "TemplatedComponent";
    const targetDirectory = "./src/sandbox-templates";
    const request: MVPSddScaffoldRequest = {
      requestingAgentId: mockRequestingAgentId,
      componentName: componentName,
      sddComponentType: SddComponentType.AGENT,
      targetDirectory: targetDirectory,
      templateVariables: {
        authorName: "Test User",
        featureDescription: "a new amazing feature",
      },
    };

    const result: ContractResult<MVPSddScaffoldOutput, AgentError> =
      await agent.generateSddScaffold(request);

    expect(result.success).toBe(true);
    const output = result.result as MVPSddScaffoldOutput;
    expect(output.generatedFileContents).toBeDefined();
    expect(output.generatedFileContents).toHaveLength(2); // Agent and Contract

    const agentContent = output.generatedFileContents?.find((f) =>
      f.filePath.endsWith(".agent.ts")
    );
    const contractContent = output.generatedFileContents?.find((f) =>
      f.filePath.endsWith(".contract.ts")
    );

    expect(agentContent).toBeDefined();
    expect(agentContent?.content).toContain("TestUser");
    expect(agentContent?.content).toContain("ANewAmazingFeature");

    expect(contractContent).toBeDefined();
    expect(contractContent?.content).toContain("TestUser");
    expect(contractContent?.content).toContain("ANewAmazingFeature");
  });

  // Add a new describe block for OverwritePolicy tests
  describe("OverwritePolicy Tests", () => {
    const componentName = "OverwriteTestComponent";
    const targetDirectory = "./src/sandbox-overwrite";
    // Base request for overwrite policy tests, using SddComponentType.AGENT
    // which generates an agent file and a contract file.
    const baseRequest: Omit<MVPSddScaffoldRequest, "overwritePolicy"> = {
      requestingAgentId: mockRequestingAgentId,
      componentName,
      sddComponentType: SddComponentType.AGENT,
      targetDirectory,
    };

    const expectedComponentDir = path.join(
      targetDirectory,
      componentName.toLowerCase()
    );
    const expectedAgentFilePath = path.join(
      expectedComponentDir,
      `${componentName}.agent.ts`
    );
    const expectedContractFilePath = path.join(
      expectedComponentDir,
      `${componentName}.contract.ts`
    );

    // Helper to configure mockStat for specific file existence scenarios
    const setupMockStat = (agentExists: boolean, contractExists: boolean) => {
      mockStat.mockImplementation(async (file) => {
        if (file === expectedAgentFilePath) {
          if (agentExists) return {} as any; // File exists, using 'any' as Stats type from 'fs/promises' is not directly used
          throw { code: "ENOENT" }; // File does not exist
        }
        if (file === expectedContractFilePath) {
          if (contractExists) return {} as any; // File exists, using 'any'
          throw { code: "ENOENT" }; // File does not exist
        }
        // Default mock for template files, assume they exist and can be read by readFile
        // This is important because _scaffoldSingleComponent tries to read template files.
        // If we don't mock this, readFile will use its default mock which might not be what we want for templates.
        if (
          typeof file === "string" &&
          (file.includes("agent.template.ts") ||
            file.includes("contract.template.ts") ||
            file.includes("test.template.ts"))
        ) {
          return {} as any; // Template file exists
        }
        throw { code: "ENOENT" }; // Default to not found for other paths
      });
    };

    // Test for OverwritePolicy.ERROR_IF_EXISTS
    describe("OverwritePolicy.ERROR_IF_EXISTS", () => {
      const policy = OverwritePolicy.ERROR_IF_EXISTS;

      it("should succeed if all target files do not exist", async () => {
        setupMockStat(false, false); // Neither agent nor contract file exists
        const request: MVPSddScaffoldRequest = {
          ...baseRequest,
          overwritePolicy: policy,
        };
        const result = await agent.generateSddScaffold(request);

        expect(result.success).toBe(true);
        const output = result.result as MVPSddScaffoldOutput;
        expect(output.overallStatus).toBe("success");
        expect(output.summaryMessage).toContain(
          `Successfully scaffolded basic agent and contract files for ${componentName}`
        );
        expect(output.generatedFiles).toEqual(
          expect.arrayContaining([
            expectedAgentFilePath,
            expectedContractFilePath,
          ])
        );
        expect(output.generatedFiles).toHaveLength(2);
        expect(mockMkdir).toHaveBeenCalledWith(expectedComponentDir, {
          recursive: true,
        });
        expect(mockWriteFile).toHaveBeenCalledWith(
          expectedAgentFilePath,
          expect.stringContaining(componentName)
        );
        expect(mockWriteFile).toHaveBeenCalledWith(
          expectedContractFilePath,
          expect.stringContaining(componentName)
        );
      });

      it("should fail if agent file exists", async () => {
        setupMockStat(true, false); // Agent file exists, contract does not
        const request: MVPSddScaffoldRequest = {
          ...baseRequest,
          overwritePolicy: policy,
        };
        const result = await agent.generateSddScaffold(request);

        expect(result.success).toBe(false);
        expect(result.result).toBeUndefined();
        expect(result.error).toBeDefined();
        expect(result.error?.category).toEqual(ErrorCategory.FILE_SYSTEM_ERROR);
        expect(result.error?.message).toContain(
          `File ${expectedAgentFilePath} already exists. OverwritePolicy is ERROR_IF_EXISTS.`
        );
        expect(mockWriteFile).not.toHaveBeenCalled();
        // Mkdir might be called before the check, depending on agent logic.
        // If it's called, it's fine. If not, also fine if error is raised early.
      });

      it("should fail if contract file exists", async () => {
        setupMockStat(false, true); // Contract file exists, agent does not
        const request: MVPSddScaffoldRequest = {
          ...baseRequest,
          overwritePolicy: policy,
        };
        const result = await agent.generateSddScaffold(request);

        expect(result.success).toBe(false);
        expect(result.result).toBeUndefined();
        expect(result.error).toBeDefined();
        expect(result.error?.category).toEqual(ErrorCategory.FILE_SYSTEM_ERROR);
        // The agent checks agent file first, then contract file.
        // So if agent doesn't exist but contract does, it will try to write agent, then fail on contract.
        // Let's adjust the agent's error message or this test based on actual agent behavior.
        // Assuming agent checks contract file after attempting/checking agent file.
        // If agent logic is: check all -> write all OR error, then this test is fine.
        // If agent logic is: check agent -> write agent -> check contract -> write contract, then error message changes.
        // The current agent _scaffoldSingleComponent checks existence before writing.
        // _scaffoldFullAgentSet calls _scaffoldSingleComponent for each.
        // So, the first existing file encountered will cause the error.
        // If agent file doesn't exist, it will proceed to contract.
        expect(result.error?.message).toContain(
          `File ${expectedContractFilePath} already exists. OverwritePolicy is ERROR_IF_EXISTS.`
        );
        expect(mockWriteFile).toHaveBeenCalledTimes(1); // Attempted to write agent file
        expect(mockWriteFile).toHaveBeenCalledWith(
          expectedAgentFilePath,
          expect.any(String)
        );
        expect(mockWriteFile).not.toHaveBeenCalledWith(
          expectedContractFilePath,
          expect.any(String)
        );
      });

      it("should fail if both target files exist", async () => {
        setupMockStat(true, true); // Both files exist
        const request: MVPSddScaffoldRequest = {
          ...baseRequest,
          overwritePolicy: policy,
        };
        const result = await agent.generateSddScaffold(request);

        expect(result.success).toBe(false);
        expect(result.result).toBeUndefined();
        expect(result.error).toBeDefined();
        expect(result.error?.category).toEqual(ErrorCategory.FILE_SYSTEM_ERROR);
        expect(result.error?.message).toContain(
          `File ${expectedAgentFilePath} already exists. OverwritePolicy is ERROR_IF_EXISTS.`
        );
        expect(mockWriteFile).not.toHaveBeenCalled();
      });
    });

    // Test for OverwritePolicy.OVERWRITE
    describe("OverwritePolicy.OVERWRITE", () => {
      const policy = OverwritePolicy.OVERWRITE;

      it("should succeed and write all files if none exist", async () => {
        setupMockStat(false, false);
        const request: MVPSddScaffoldRequest = {
          ...baseRequest,
          overwritePolicy: policy,
        };
        const result = await agent.generateSddScaffold(request);

        expect(result.success).toBe(true);
        const output = result.result as MVPSddScaffoldOutput;
        expect(output.overallStatus).toBe("success");
        expect(output.generatedFiles).toEqual(
          expect.arrayContaining([
            expectedAgentFilePath,
            expectedContractFilePath,
          ])
        );
        expect(mockWriteFile).toHaveBeenCalledTimes(2);
        expect(mockWriteFile).toHaveBeenCalledWith(
          expectedAgentFilePath,
          expect.any(String)
        );
        expect(mockWriteFile).toHaveBeenCalledWith(
          expectedContractFilePath,
          expect.any(String)
        );
      });

      it("should succeed and overwrite existing agent file, create contract file", async () => {
        setupMockStat(true, false); // Agent exists, contract does not
        const request: MVPSddScaffoldRequest = {
          ...baseRequest,
          overwritePolicy: policy,
        };
        const result = await agent.generateSddScaffold(request);

        expect(result.success).toBe(true);
        const output = result.result as MVPSddScaffoldOutput;
        expect(output.overallStatus).toBe("success");
        expect(output.summaryMessage).toContain("successfully scaffolded");
        expect(output.generatedFiles).toEqual(
          expect.arrayContaining([
            expectedAgentFilePath,
            expectedContractFilePath,
          ])
        );
        expect(mockWriteFile).toHaveBeenCalledTimes(2);
        expect(mockWriteFile).toHaveBeenCalledWith(
          expectedAgentFilePath,
          expect.any(String)
        ); // Overwritten
        expect(mockWriteFile).toHaveBeenCalledWith(
          expectedContractFilePath,
          expect.any(String)
        ); // Created
      });

      it("should succeed and create agent file, overwrite existing contract file", async () => {
        setupMockStat(false, true); // Agent does not exist, contract exists
        const request: MVPSddScaffoldRequest = {
          ...baseRequest,
          overwritePolicy: policy,
        };
        const result = await agent.generateSddScaffold(request);

        expect(result.success).toBe(true);
        const output = result.result as MVPSddScaffoldOutput;
        expect(output.overallStatus).toBe("success");
        expect(output.summaryMessage).toContain("successfully scaffolded");
        expect(output.generatedFiles).toEqual(
          expect.arrayContaining([
            expectedAgentFilePath,
            expectedContractFilePath,
          ])
        );
        expect(mockWriteFile).toHaveBeenCalledTimes(2);
        expect(mockWriteFile).toHaveBeenCalledWith(
          expectedAgentFilePath,
          expect.any(String)
        ); // Created
        expect(mockWriteFile).toHaveBeenCalledWith(
          expectedContractFilePath,
          expect.any(String)
        ); // Overwritten
      });

      it("should succeed and overwrite all files if both exist", async () => {
        setupMockStat(true, true); // Both exist
        const request: MVPSddScaffoldRequest = {
          ...baseRequest,
          overwritePolicy: policy,
        };
        const result = await agent.generateSddScaffold(request);

        expect(result.success).toBe(true);
        const output = result.result as MVPSddScaffoldOutput;
        expect(output.overallStatus).toBe("success");
        expect(output.summaryMessage).toContain("successfully scaffolded");
        expect(output.generatedFiles).toEqual(
          expect.arrayContaining([
            expectedAgentFilePath,
            expectedContractFilePath,
          ])
        );
        expect(mockWriteFile).toHaveBeenCalledTimes(2);
        expect(mockWriteFile).toHaveBeenCalledWith(
          expectedAgentFilePath,
          expect.any(String)
        ); // Overwritten
        expect(mockWriteFile).toHaveBeenCalledWith(
          expectedContractFilePath,
          expect.any(String)
        ); // Overwritten
      });
    });

    // Test for OverwritePolicy.SKIP
    describe("OverwritePolicy.SKIP", () => {
      const policy = OverwritePolicy.SKIP;

      it("should succeed and write all files if none exist", async () => {
        setupMockStat(false, false);
        const request: MVPSddScaffoldRequest = {
          ...baseRequest,
          overwritePolicy: policy,
        };
        const result = await agent.generateSddScaffold(request);

        expect(result.success).toBe(true);
        const output = result.result as MVPSddScaffoldOutput;
        expect(output.overallStatus).toBe("success");
        expect(output.generatedFiles).toEqual(
          expect.arrayContaining([
            expectedAgentFilePath,
            expectedContractFilePath,
          ])
        );
        expect(mockWriteFile).toHaveBeenCalledTimes(2);
      });

      it("should succeed, skip existing agent file, and write contract file", async () => {
        setupMockStat(true, false); // Agent exists, contract does not
        const request: MVPSddScaffoldRequest = {
          ...baseRequest,
          overwritePolicy: policy,
        };
        const result = await agent.generateSddScaffold(request);

        expect(result.success).toBe(true);
        const output = result.result as MVPSddScaffoldOutput;
        expect(output.overallStatus).toBe("success");
        // Summary message should indicate skip for agent, creation for contract
        expect(output.summaryMessage).toContain(
          `Skipped existing file ${expectedAgentFilePath}`
        );
        expect(output.summaryMessage).toContain(
          `Successfully created ${expectedContractFilePath}`
        );

        expect(output.generatedFiles).toEqual(
          expect.arrayContaining([
            // generatedFiles lists all attempted/relevant files
            expectedAgentFilePath,
            expectedContractFilePath,
          ])
        );
        expect(mockWriteFile).toHaveBeenCalledTimes(1);
        expect(mockWriteFile).not.toHaveBeenCalledWith(
          expectedAgentFilePath,
          expect.any(String)
        );
        expect(mockWriteFile).toHaveBeenCalledWith(
          expectedContractFilePath,
          expect.any(String)
        );
      });

      it("should succeed, write agent file, and skip existing contract file", async () => {
        setupMockStat(false, true); // Agent does not exist, contract exists
        const request: MVPSddScaffoldRequest = {
          ...baseRequest,
          overwritePolicy: policy,
        };
        const result = await agent.generateSddScaffold(request);

        expect(result.success).toBe(true);
        const output = result.result as MVPSddScaffoldOutput;
        expect(output.overallStatus).toBe("success");
        expect(output.summaryMessage).toContain(
          `Successfully created ${expectedAgentFilePath}`
        );
        expect(output.summaryMessage).toContain(
          `Skipped existing file ${expectedContractFilePath}`
        );

        expect(output.generatedFiles).toEqual(
          expect.arrayContaining([
            expectedAgentFilePath,
            expectedContractFilePath,
          ])
        );
        expect(mockWriteFile).toHaveBeenCalledTimes(1);
        expect(mockWriteFile).toHaveBeenCalledWith(
          expectedAgentFilePath,
          expect.any(String)
        );
        expect(mockWriteFile).not.toHaveBeenCalledWith(
          expectedContractFilePath,
          expect.any(String)
        );
      });

      it("should succeed and skip all files if both exist", async () => {
        setupMockStat(true, true); // Both exist
        const request: MVPSddScaffoldRequest = {
          ...baseRequest,
          overwritePolicy: policy,
        };
        const result = await agent.generateSddScaffold(request);

        expect(result.success).toBe(true);
        const output = result.result as MVPSddScaffoldOutput;
        expect(output.overallStatus).toBe("success");
        expect(output.summaryMessage).toContain(
          `Skipped existing file ${expectedAgentFilePath}`
        );
        expect(output.summaryMessage).toContain(
          `Skipped existing file ${expectedContractFilePath}`
        );

        expect(output.generatedFiles).toEqual(
          expect.arrayContaining([
            expectedAgentFilePath,
            expectedContractFilePath,
          ])
        );
        expect(mockWriteFile).not.toHaveBeenCalled();
      });
    });

    // Test for default behavior (no overwritePolicy provided, should be ERROR_IF_EXISTS)
    describe("Default OverwritePolicy (undefined)", () => {
      it("should succeed if all target files do not exist", async () => {
        setupMockStat(false, false);
        const request: MVPSddScaffoldRequest = { ...baseRequest }; // No overwritePolicy
        const result = await agent.generateSddScaffold(request);

        expect(result.success).toBe(true);
        const output = result.result as MVPSddScaffoldOutput;
        expect(output.overallStatus).toBe("success");
        expect(output.generatedFiles).toHaveLength(2);
        expect(mockWriteFile).toHaveBeenCalledTimes(2);
      });

      it("should fail if agent file exists (defaulting to ERROR_IF_EXISTS)", async () => {
        setupMockStat(true, false); // Agent file exists
        const request: MVPSddScaffoldRequest = { ...baseRequest }; // No overwritePolicy
        const result = await agent.generateSddScaffold(request);

        expect(result.success).toBe(false);
        expect(result.error).toBeDefined();
        expect(result.error?.category).toEqual(ErrorCategory.FILE_SYSTEM_ERROR);
        expect(result.error?.message).toContain(
          `File ${expectedAgentFilePath} already exists. OverwritePolicy is ERROR_IF_EXISTS.`
        );
        expect(mockWriteFile).not.toHaveBeenCalled();
      });

      it("should fail if contract file exists (defaulting to ERROR_IF_EXISTS)", async () => {
        setupMockStat(false, true); // Contract file exists
        const request: MVPSddScaffoldRequest = { ...baseRequest }; // No overwritePolicy
        const result = await agent.generateSddScaffold(request);

        expect(result.success).toBe(false);
        expect(result.error).toBeDefined();
        expect(result.error?.category).toEqual(ErrorCategory.FILE_SYSTEM_ERROR);
        expect(result.error?.message).toContain(
          `File ${expectedContractFilePath} already exists. OverwritePolicy is ERROR_IF_EXISTS.`
        );
        // Agent file would have been written before contract file check failed
        expect(mockWriteFile).toHaveBeenCalledTimes(1);
        expect(mockWriteFile).toHaveBeenCalledWith(
          expectedAgentFilePath,
          expect.any(String)
        );
      });
    });
  });
});
