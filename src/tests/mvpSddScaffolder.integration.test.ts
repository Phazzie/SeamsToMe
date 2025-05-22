import * as fs from "fs/promises";
import * as os from "os";
import * as path from "path";
import rimraf from "rimraf";
import { MVPSddScaffolderAgent } from "../agents/mvpSddScaffolder.agent";
import {
  IMVPSddScaffolderAgent,
  MVPSddScaffoldRequest, // Changed from MVPSddScaffoldInput
  MVPSddScaffoldOutput,
  SddComponentType,
  OverwritePolicy,
  GeneratedFileDetail, // Added for generatedFileContents
} from "../contracts/mvpSddScaffolder.contract";
import { AgentId, ErrorCategory, AgentError } from "../contracts/types"; // Corrected IAgentError to AgentError

// Minimal ILogger and ITelemetry interfaces for the agent to compile
interface ILogger {
  info(message: string): void;
  warn(message: string): void;
  error(message: string, error?: any): void;
  debug(message: string): void;
}

interface ITelemetry {
  trackEvent(eventName: string, properties?: Record<string, any>): void;
}

// Mock implementations
const mockLogger: ILogger = {
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
};

const mockTelemetry: ITelemetry = {
  trackEvent: jest.fn(),
};

const SDD_BLUEPRINT_COMMENT_IDENTIFIER = "@SDD_Blueprint"; // Identifier to check for in agent content

describe("MVPSddScaffolderAgent Integration Tests", () => {
  let agent: IMVPSddScaffolderAgent;
  let tempTestDir: string;
  const testAgentId = "test-scaffolder-integration" as AgentId;

  beforeEach(async () => {
    agent = new MVPSddScaffolderAgent(mockLogger, mockTelemetry); // Use mock logger and telemetry
    // Create a unique temporary directory for each test run
    tempTestDir = await fs.mkdtemp(
      path.join(os.tmpdir(), "sdd-scaffolder-integration-")
    );
  });

  afterEach(async () => {
    // Clean up the temporary directory
    await new Promise<void>((resolve, reject) => {
      rimraf(tempTestDir, (err) => {
        if (err) {
          // It's possible the directory doesn't exist if a test cleans it up early
          // or fails before creating it. Only reject if it's not an ENOENT error.
          if (err.code === 'ENOENT') {
            resolve();
          } else {
            console.error('Failed to delete temp directory:', tempTestDir, err);
            reject(err);
          }
        } else {
          resolve();
        }
      });
    });
  });

  const expectedAgentContent = (
    componentName: string,
    pascalCaseName: string
  ) => `/**
 * @SDD_Blueprint ${pascalCaseName} (agent)
 * @Phase 1: Contract (Define the interface and data structures)
 * @Phase 2: Stub (Implement the simplest version to satisfy the contract)
 * @Phase 3: Test (Write tests to verify the contract and stub)
 * @Phase 4: Implement (Flesh out the functionality)
 * @Phase 5: Review (Peer review and refactor)
 * @Phase 6: Document (Update documentation)
 * @Phase 7: Deploy (Release the new component)
 */
// TODO: Implement the agent for ${pascalCaseName}
// AGENT_VERSION: 0.1.0
// SDD_TARGET_CONTRACT_VERSION: 0.1.0

import { AgentId, ContractResult, createNotImplementedError, AgentError } from './types'; // Adjusted path, Added AgentError
import { I${pascalCaseName}Agent, ${pascalCaseName}Input, ${pascalCaseName}Output } from './${componentName}.contract'; // Adjusted path

export class ${pascalCaseName}Agent implements I${pascalCaseName}Agent {
  private agentId: AgentId;
  // TODO: Add ILogger and ITelemetry if needed by the agent's logic
  // private readonly logger: ILogger;
  // private readonly telemetry: ITelemetry;

  constructor(agentId: AgentId = '${componentName}-agent' as AgentId /*, logger: ILogger, telemetry: ITelemetry */) {
    this.agentId = agentId;
    // this.logger = logger;
    // this.telemetry = telemetry;
    // console.log(\`[AGENT_ID_PLACEHOLDER]: Agent initialized.\`); // Made comment static
  }

  async doSomething(input: ${pascalCaseName}Input): Promise<ContractResult<${pascalCaseName}Output, AgentError>> {
    // console.log(\`[AGENT_ID_PLACEHOLDER]: doSomething called with input:\`, input); // Made comment static
    // console.log(\`TELEMETRY: AGENT_ID_PLACEHOLDER.doSomething.start\`, { input }); // Made comment static
    // TODO: Implement actual logic
    const notImplementedError = createNotImplementedError(this.agentId, 'doSomething', input.requestingAgentId);
    // console.error(\`[AGENT_ID_PLACEHOLDER]: Method not implemented.\`, notImplementedError); // Made comment static
    // console.log(\`TELEMETRY: AGENT_ID_PLACEHOLDER.doSomething.failure\`, { error: notImplementedError }); // Made comment static
    return { success: false, error: notImplementedError };
  }
}
`;

  const expectedContractContent = (
    componentName: string,
    pascalCaseName: string
  ) => `// CONTRACT_VERSION: 0.1.0
/**
 * @SDD_Blueprint ${pascalCaseName} (contract)
 * @Phase 1: Define operations and data structures for ${pascalCaseName}Agent.
 * @Phase 2: Review and refine with stakeholders.
 * @Phase 3: Implement in the agent.
 * @Phase 4: Write contract tests.
 */
// TODO: Define the input, output, and methods for this agent's contract.
import { AgentId, ContractResult, AgentError } from './types'; // Assuming types.ts is in the same directory

export interface ${pascalCaseName}Input {
  requestingAgentId: AgentId;
  // TODO: Define input properties
  data: string;
}

export interface ${pascalCaseName}Output {
  // TODO: Define output properties
  message: string;
}

export interface I${pascalCaseName}Agent {
  doSomething(input: ${pascalCaseName}Input): Promise<ContractResult<${pascalCaseName}Output, AgentError>>;
}
`;

  const expectedTestContent = (
    componentName: string,
    pascalCaseName: string
  ) => `// TEST_VERSION: 0.1.0
/**
 * @SDD_Blueprint ${pascalCaseName} (test)
 * @Phase 1: Write tests for the contract defined in ${componentName}.contract.ts.
 * @Phase 2: Ensure all operations and scenarios are covered.
 * @Phase 3: Run tests against the implemented agent.
 */
// TODO: Implement comprehensive tests for all contract methods.
import { I${pascalCaseName}Agent, ${pascalCaseName}Input, ${pascalCaseName}Output } from '../contracts/${componentName}.contract';
import { ${pascalCaseName}Agent } from '../agents/${componentName}.agent';
import { AgentId, ContractResult, ErrorCategory, AgentError, createNotImplementedError } from '../contracts/types';

describe('${pascalCaseName}Agent Contract Tests', () => {
  let agent: I${pascalCaseName}Agent;
  const mockRequestingAgentId = 'test-rig-agent' as AgentId;
  // TODO: Add mock ILogger and ITelemetry if the agent constructor requires them
  // const mockLogger: ILogger = { info: jest.fn(), warn: jest.fn(), error: jest.fn(), debug: jest.fn() };
  // const mockTelemetry: ITelemetry = { trackEvent: jest.fn() };

  beforeEach(() => {
    agent = new ${pascalCaseName}Agent(/* mockLogger, mockTelemetry */);
  });

  describe('doSomething', () => {
    it('should return a NotImplementedError for initial stub', async () => {
      const input: ${pascalCaseName}Input = {
        requestingAgentId: mockRequestingAgentId,
        data: 'test data',
      };
      const result = await agent.doSomething(input);

      expect(result.success).toBe(false);
      expect(result.result).toBeUndefined();
      expect(result.error).toBeDefined();
      const error = result.error as AgentError;
      expect(error.name).toEqual('NotImplementedError');
      expect(error.category).toEqual(ErrorCategory.UNEXPECTED_ERROR); // Or a more specific category if set by createNotImplementedError
      expect(error.message).toContain("Method 'doSomething' is not implemented.");
      expect(error.agentId).toEqual('${componentName}-agent'); // Default agentId from template
      expect(error.methodName).toEqual('doSomething');
      expect(error.requestingAgentId).toEqual(mockRequestingAgentId);
    });

    // TODO: Add more tests for happy paths and other error conditions
    // once the agent method is implemented.
  });
});
`;

  it("should create agent, contract, and test files for FULL_AGENT_SET in the specified directory", async () => {
    const componentName = "myNewComponent";
    const pascalCaseName = "MyNewComponent";
    const input: MVPSddScaffoldRequest = { // Changed to MVPSddScaffoldRequest
      requestingAgentId: testAgentId,
      sddComponentType: SddComponentType.FULL_AGENT_SET,
      componentName,
      targetDirectory: tempTestDir,
      // templateVariables: { user: "TestUser", version: "0.0.1" }, // Template variables not currently used by agent
    };

    const result = await agent.generateSddScaffold(input);

    expect(result.success).toBe(true); // Check success flag
    expect(result.error).toBeUndefined();
    expect(result.result).toBeDefined();
    const output = result.result as MVPSddScaffoldOutput;

    expect(output.overallStatus).toBe("success");
    // Updated summary message check based on agent changes
    expect(output.summaryMessage).toBe(
      `Full agent set for '${componentName}' scaffolded successfully: 3 files created/overwritten.`
    );
    expect(output.generatedFiles).toHaveLength(3);
    expect(output.skippedFiles).toBeUndefined(); // No files should be skipped

    const expectedAgentDir = path.join(tempTestDir, "agents");
    const expectedContractDir = path.join(tempTestDir, "contracts");
    const expectedTestDir = path.join(tempTestDir, "tests");


    const expectedAgentPath = path.join(
      expectedAgentDir, // Updated to use agentDir
      `${componentName}.agent.ts`
    );
    const expectedContractPath = path.join(
      expectedContractDir, // Updated to use contractDir
      `${componentName}.contract.ts`
    );
    const expectedTestPath = path.join(
      expectedTestDir, // Updated to use testDir
      `${componentName}.contract.test.ts`
    );

    // Verify generatedFiles (array of strings)
    expect(output.generatedFiles).toContain(expectedAgentPath);
    expect(output.generatedFiles).toContain(expectedContractPath);
    expect(output.generatedFiles).toContain(expectedTestPath);

    // Verify generatedFileContents
    expect(output.generatedFileContents).toBeDefined();
    expect(Array.isArray(output.generatedFileContents)).toBe(true);
    expect(output.generatedFileContents).toHaveLength(3);

    const agentFileDetail = output.generatedFileContents?.find(f => f.filePath === expectedAgentPath);
    expect(agentFileDetail).toBeDefined();
    expect(agentFileDetail?.content).toEqual(expectedAgentContent(componentName, pascalCaseName));
    expect(agentFileDetail?.content).toContain(SDD_BLUEPRINT_COMMENT_IDENTIFIER); // Check for blueprint comment

    const contractFileDetail = output.generatedFileContents?.find(f => f.filePath === expectedContractPath);
    expect(contractFileDetail).toBeDefined();
    expect(contractFileDetail?.content).toEqual(expectedContractContent(componentName, pascalCaseName));
    expect(contractFileDetail?.content).toContain(SDD_BLUEPRINT_COMMENT_IDENTIFIER);


    const testFileDetail = output.generatedFileContents?.find(f => f.filePath === expectedTestPath);
    expect(testFileDetail).toBeDefined();
    expect(testFileDetail?.content).toEqual(expectedTestContent(componentName, pascalCaseName));
    expect(testFileDetail?.content).toContain(SDD_BLUEPRINT_COMMENT_IDENTIFIER);


    // Verify actual files on disk as a final check (optional, as generatedFileContents should be authoritative)
    const agentDiskContent = await fs.readFile(expectedAgentPath, "utf-8");
    expect(agentDiskContent).toEqual(expectedAgentContent(componentName, pascalCaseName));
  });

  it("should create only an agent file for SddComponentType.AGENT", async () => {
    const componentName = "myAgentOnly";
    const pascalCaseName = "MyAgentOnly";
    const input: MVPSddScaffoldRequest = { // Changed to MVPSddScaffoldRequest
      requestingAgentId: testAgentId,
      sddComponentType: SddComponentType.AGENT,
      componentName,
      targetDirectory: tempTestDir,
    };

    const result = await agent.generateSddScaffold(input);
    expect(result.success).toBe(true);
    expect(result.error).toBeUndefined();
    const output = result.result as MVPSddScaffoldOutput;
    expect(output.overallStatus).toBe("success");
    // Updated summary message
    expect(output.summaryMessage).toBe(
      `Component '${componentName}' of type '${SddComponentType.AGENT}' scaffolded successfully.`
    );
    expect(output.generatedFiles).toHaveLength(1);
    expect(output.skippedFiles).toBeUndefined();

    const componentSubDir = path.join(tempTestDir, componentName); // Agent creates a subdirectory for single components
    const expectedAgentPath = path.join(
      componentSubDir, // Updated path
      `${componentName}.agent.ts`
    );
    expect(output.generatedFiles[0]).toEqual(expectedAgentPath);

    // Verify generatedFileContents
    expect(output.generatedFileContents).toBeDefined();
    expect(Array.isArray(output.generatedFileContents)).toBe(true);
    expect(output.generatedFileContents).toHaveLength(1);
    const agentFileDetail = output.generatedFileContents?.[0];
    expect(agentFileDetail?.filePath).toEqual(expectedAgentPath);
    expect(agentFileDetail?.content).toEqual(expectedAgentContent(componentName, pascalCaseName));
    expect(agentFileDetail?.content).toContain(SDD_BLUEPRINT_COMMENT_IDENTIFIER);


    // Ensure other files are not created
    const expectedContractPath = path.join(
      componentSubDir,
      `${componentName}.contract.ts`
    );
    const expectedTestPath = path.join(
      componentSubDir,
      `${componentName}.contract.test.ts`
    );
    await expect(fs.access(expectedContractPath)).rejects.toThrow();
    await expect(fs.access(expectedTestPath)).rejects.toThrow();
  });

  it("should create only a contract file for SddComponentType.CONTRACT", async () => {
    const componentName = "myContractOnly";
    const pascalCaseName = "MyContractOnly";
    const input: MVPSddScaffoldRequest = { // Changed to MVPSddScaffoldRequest
      requestingAgentId: testAgentId,
      sddComponentType: SddComponentType.CONTRACT,
      componentName,
      targetDirectory: tempTestDir,
    };

    const result = await agent.generateSddScaffold(input);
    expect(result.success).toBe(true);
    expect(result.error).toBeUndefined();
    const output = result.result as MVPSddScaffoldOutput;
    expect(output.overallStatus).toBe("success");
    // Updated summary message
    expect(output.summaryMessage).toBe(
      `Component '${componentName}' of type '${SddComponentType.CONTRACT}' scaffolded successfully.`
    );
    expect(output.generatedFiles).toHaveLength(1);

    const componentSubDir = path.join(tempTestDir, componentName);
    const expectedContractPath = path.join(
      componentSubDir, // Updated path
      `${componentName}.contract.ts`
    );
    expect(output.generatedFiles[0]).toEqual(expectedContractPath);

    // Verify generatedFileContents
    expect(output.generatedFileContents).toBeDefined();
    expect(Array.isArray(output.generatedFileContents)).toBe(true);
    expect(output.generatedFileContents).toHaveLength(1);
    const contractFileDetail = output.generatedFileContents?.[0];
    expect(contractFileDetail?.filePath).toEqual(expectedContractPath);
    expect(contractFileDetail?.content).toEqual(expectedContractContent(componentName, pascalCaseName));
    expect(contractFileDetail?.content).toContain(SDD_BLUEPRINT_COMMENT_IDENTIFIER);

    const expectedAgentPath = path.join(
      componentSubDir,
      `${componentName}.agent.ts`
    );
    const expectedTestPath = path.join(
      componentSubDir,
      `${componentName}.contract.test.ts`
    );
    await expect(fs.access(expectedAgentPath)).rejects.toThrow();
    await expect(fs.access(expectedTestPath)).rejects.toThrow();
  });

  it("should create only a test file for SddComponentType.TEST", async () => {
    const componentName = "myTestOnly";
    const pascalCaseName = "MyTestOnly";
    const input: MVPSddScaffoldRequest = { // Changed to MVPSddScaffoldRequest
      requestingAgentId: testAgentId,
      sddComponentType: SddComponentType.TEST,
      componentName,
      targetDirectory: tempTestDir,
    };

    const result = await agent.generateSddScaffold(input);
    expect(result.success).toBe(true);
    expect(result.error).toBeUndefined();
    const output = result.result as MVPSddScaffoldOutput;
    expect(output.overallStatus).toBe("success");
    // Updated summary message
    expect(output.summaryMessage).toBe(
      `Component '${componentName}' of type '${SddComponentType.TEST}' scaffolded successfully.`
    );
    expect(output.generatedFiles).toHaveLength(1);

    const componentSubDir = path.join(tempTestDir, componentName);
    const expectedTestPath = path.join(
      componentSubDir, // Updated path
      `${componentName}.contract.test.ts`
    );
    expect(output.generatedFiles[0]).toEqual(expectedTestPath);

    // Verify generatedFileContents
    expect(output.generatedFileContents).toBeDefined();
    expect(Array.isArray(output.generatedFileContents)).toBe(true);
    expect(output.generatedFileContents).toHaveLength(1);
    const testFileDetail = output.generatedFileContents?.[0];
    expect(testFileDetail?.filePath).toEqual(expectedTestPath);
    expect(testFileDetail?.content).toEqual(expectedTestContent(componentName, pascalCaseName));
    expect(testFileDetail?.content).toContain(SDD_BLUEPRINT_COMMENT_IDENTIFIER);


    const expectedAgentPath = path.join(
      componentSubDir,
      `${componentName}.agent.ts`
    );
    const expectedContractPath = path.join(
      componentSubDir,
      `${componentName}.contract.ts`
    );
    await expect(fs.access(expectedAgentPath)).rejects.toThrow();
    await expect(fs.access(expectedContractPath)).rejects.toThrow();
  });

  it("should return an error if targetDirectory does not exist and cannot be created (e.g. permission issue - simulated by making it a file)", async () => {
    const componentName = "testFailure";
    // Simulate an unwritable target directory by creating a file with the same name
    // For this test to be robust against the agent's directory creation logic,
    // the targetDirectory itself should be the file, not a subdirectory within it.
    const unwritableTargetDirectory = path.join(tempTestDir, "unwritable-dir-sim");
    await fs.writeFile(unwritableTargetDirectory, "I am a file, not a directory");


    const input: MVPSddScaffoldRequest = { // Changed to MVPSddScaffoldRequest
      requestingAgentId: testAgentId,
      sddComponentType: SddComponentType.AGENT,
      componentName,
      targetDirectory: unwritableTargetDirectory, // Attempting to use the file path as a directory
    };

    const result = await agent.generateSddScaffold(input);

    expect(result.success).toBe(false); // Check success flag
    expect(result.result).toBeUndefined();
    expect(result.error).toBeDefined();
    const error = result.error as AgentError;
    // The agent now tries to create subdirectories like 'agents', 'contracts' or componentName
    // So the error will likely be from mkdir failing on a path where a segment is a file.
    expect(error.category).toBe(ErrorCategory.FILE_SYSTEM_ERROR); // Or OPERATION_FAILED depending on agent's error mapping
    expect(error.message).toMatch(/Failed to generate SDD scaffold: Failed to create directory|Failed to copy and rename template/i);
    // expect(error.details).toBeDefined(); // Check if details are populated by createAgentError

    // Clean up the dummy file
    await fs.unlink(unwritableTargetDirectory);
  });

  it("should return an error for invalid componentName (empty)", async () => {
    const input: MVPSddScaffoldRequest = { // Changed to MVPSddScaffoldRequest
      requestingAgentId: testAgentId,
      sddComponentType: SddComponentType.AGENT,
      componentName: "", // Invalid
      targetDirectory: tempTestDir,
    };
    const result = await agent.generateSddScaffold(input);
    expect(result.success).toBe(false);
    expect(result.result).toBeUndefined();
    expect(result.error).toBeDefined();
    const error = result.error as AgentError;
    expect(error.category).toBe(ErrorCategory.VALIDATION_ERROR); // Corrected category
    expect(error.message).toContain("Missing required input: componentName, targetDirectory, or sddComponentType.");
  });

  it("should return an error for invalid targetDirectory (empty)", async () => {
    const input: MVPSddScaffoldRequest = { // Changed to MVPSddScaffoldRequest
      requestingAgentId: testAgentId,
      sddComponentType: SddComponentType.AGENT,
      componentName: "myValidComponent",
      targetDirectory: "", // Invalid
    };
    const result = await agent.generateSddScaffold(input);
    expect(result.success).toBe(false);
    expect(result.result).toBeUndefined();
    expect(result.error).toBeDefined();
    const error = result.error as AgentError;
    expect(error.category).toBe(ErrorCategory.VALIDATION_ERROR); // Corrected category
    expect(error.message).toContain("Missing required input: componentName, targetDirectory, or sddComponentType.");
  });

  it("should use OverwritePolicy.ERROR_IF_EXISTS by default if no policy is specified", async () => {
    const componentName = "defaultPolicyTest";
    const input: MVPSddScaffoldRequest = {
      requestingAgentId: testAgentId,
      sddComponentType: SddComponentType.AGENT,
      componentName,
      targetDirectory: tempTestDir,
      // No overwritePolicy specified
    };

    // First call: should succeed
    const result1 = await agent.generateSddScaffold(input);
    expect(result1.success).toBe(true);
    expect(result1.result?.overallStatus).toBe("success");
    const output1 = result1.result as MVPSddScaffoldOutput;
    const expectedAgentPath = path.join(tempTestDir, componentName, `${componentName}.agent.ts`);
    expect(output1.generatedFiles).toContain(expectedAgentPath);

    // Second call: should fail because file exists and default is ERROR_IF_EXISTS
    const result2 = await agent.generateSddScaffold(input);
    expect(result2.success).toBe(false);
    expect(result2.result).toBeUndefined();
    expect(result2.error).toBeDefined();
    expect(result2.error?.category).toBe(ErrorCategory.OPERATION_FAILED);
    expect(result2.error?.message).toContain(`Scaffolding failed: File '${expectedAgentPath}' already exists and overwrite policy is ${OverwritePolicy.ERROR_IF_EXISTS}.`);
  });

  // --- BEGIN OverwritePolicy Integration Tests ---
  describe("OverwritePolicy Integration Tests", () => {
    const componentName = "overwritePolicyTest";
    const pascalCaseName = "OverwritePolicyTest";
    const agentFileName = `${componentName}.agent.ts`;
    const contractFileName = `${componentName}.contract.ts`;
    const testFileName = `${componentName}.contract.test.ts`;

    // Helper to create a dummy file
    const createDummyFile = async (filePath: string, content = "dummy content") => {
      await fs.mkdir(path.dirname(filePath), { recursive: true });
      await fs.writeFile(filePath, content);
    };

    // Test each OverwritePolicy
    Object.values(OverwritePolicy).forEach((policy) => {
      describe(`Policy: ${policy}`, () => {
        const baseInputSingle: MVPSddScaffoldRequest = { 
          requestingAgentId: testAgentId,
          sddComponentType: SddComponentType.AGENT, 
          componentName,
          targetDirectory: tempTestDir,
          overwritePolicy: policy,
        };

        const baseInputFullSet: MVPSddScaffoldRequest = {
          requestingAgentId: testAgentId,
          sddComponentType: SddComponentType.FULL_AGENT_SET,
          componentName,
          targetDirectory: tempTestDir,
          overwritePolicy: policy,
        };

        // For SddComponentType.AGENT, files are created in a subdirectory named after the component.
        const componentSubDir = path.join(tempTestDir, componentName); // For single component
        const expectedAgentPathSingle = path.join(componentSubDir, agentFileName);

        // For SddComponentType.FULL_AGENT_SET
        const agentDirFull = path.join(tempTestDir, "agents");
        const contractDirFull = path.join(tempTestDir, "contracts");
        const testDirFull = path.join(tempTestDir, "tests");
        const expectedAgentPathFull = path.join(agentDirFull, agentFileName);
        const expectedContractPathFull = path.join(contractDirFull, contractFileName);
        const expectedTestPathFull = path.join(testDirFull, testFileName);
        const allFullSetPaths = [expectedAgentPathFull, expectedContractPathFull, expectedTestPathFull];


        it(`[AGENT] should behave correctly when no files exist [${policy}]`, async () => {
          const result = await agent.generateSddScaffold(baseInputSingle);
          expect(result.success).toBe(true);
          expect(result.error).toBeUndefined();
          const output = result.result as MVPSddScaffoldOutput;
          expect(output.overallStatus).toBe("success");
          expect(output.summaryMessage).toBe( // Agent creates 1 file for SddComponentType.AGENT
            `Component '${componentName}' of type '${SddComponentType.AGENT}' scaffolded successfully.`
          );
          expect(output.generatedFiles).toHaveLength(1);
          expect(output.generatedFiles).toContain(expectedAgentPathSingle);
          expect(output.skippedFiles).toBeUndefined();

          expect(output.generatedFileContents).toBeDefined();
          expect(output.generatedFileContents).toHaveLength(1);
          expect(output.generatedFileContents?.[0].filePath).toBe(expectedAgentPathSingle);
          expect(output.generatedFileContents?.[0].content).toEqual(expectedAgentContent(componentName, pascalCaseName));

          await expect(fs.access(expectedAgentPathSingle)).resolves.toBeUndefined();
        });

        it(`[AGENT] should behave correctly when agent file exists [${policy}]`, async () => {
          await createDummyFile(expectedAgentPathSingle, "old agent content");

          const result = await agent.generateSddScaffold(baseInputSingle);

          if (policy === OverwritePolicy.ERROR_IF_EXISTS) {
            expect(result.success).toBe(false);
            expect(result.result).toBeUndefined();
            expect(result.error).toBeDefined();
            expect(result.error?.category).toBe(ErrorCategory.OPERATION_FAILED);
            expect(result.error?.message).toContain(
              `Scaffolding failed: File '${expectedAgentPathSingle}' already exists and overwrite policy is ${OverwritePolicy.ERROR_IF_EXISTS}.`
            );
            const agentContent = await fs.readFile(expectedAgentPathSingle, "utf-8");
            expect(agentContent).toBe("old agent content"); 
          } else if (policy === OverwritePolicy.OVERWRITE) {
            expect(result.success).toBe(true);
            expect(result.error).toBeUndefined();
            const output = result.result as MVPSddScaffoldOutput;
            expect(output.overallStatus).toBe("success");
            expect(output.summaryMessage).toBe(
              `Component '${componentName}' of type '${SddComponentType.AGENT}' scaffolded successfully.` // Message for overwrite is same as new creation
            );
            expect(output.generatedFiles).toHaveLength(1);
            expect(output.generatedFiles).toContain(expectedAgentPathSingle);
            expect(output.skippedFiles).toBeUndefined(); // Ensure skippedFiles is empty or undefined

            expect(output.generatedFileContents).toBeDefined();
            expect(output.generatedFileContents).toHaveLength(1);
            expect(output.generatedFileContents?.[0].filePath).toBe(expectedAgentPathSingle);
            // Verify that generatedFileContents contains the new content
            expect(output.generatedFileContents?.[0].content).toEqual(expectedAgentContent(componentName, pascalCaseName));

            const agentContent = await fs.readFile(expectedAgentPathSingle, "utf-8");
            expect(agentContent).toEqual(expectedAgentContent(componentName, pascalCaseName)); // Should be new content
          } else if (policy === OverwritePolicy.SKIP) {
            expect(result.success).toBe(true); // Agent returns success:true even if it only skips.
            expect(result.error).toBeUndefined(); // No explicit error object for a skip.
            const output = result.result as MVPSddScaffoldOutput;

            expect(output.overallStatus).toBe("failure"); // Because the single requested component was skipped
            expect(output.summaryMessage).toBe(
              `Component '${componentName}' of type '${SddComponentType.AGENT}' already exists. Skipped.`
            );
            // Ensure skipped file path appears in output.skippedFiles
            expect(output.skippedFiles).toBeDefined();
            expect(output.skippedFiles).toHaveLength(1);
            expect(output.skippedFiles).toContain(expectedAgentPathSingle);

            // Ensure skipped file does not appear in output.generatedFiles or output.generatedFileContents
            expect(output.generatedFiles).toHaveLength(0);
            expect(output.generatedFileContents).toBeUndefined();

            const agentContent = await fs.readFile(expectedAgentPathSingle, "utf-8");
            expect(agentContent).toBe("old agent content"); // Should not have been overwritten
          }
        });

        // --- FULL_AGENT_SET OverwritePolicy Tests ---
        it(`[FULL_AGENT_SET] should behave correctly when no files exist [${policy}]`, async () => {
          const result = await agent.generateSddScaffold(baseInputFullSet);
          expect(result.success).toBe(true);
          expect(result.error).toBeUndefined();
          const output = result.result as MVPSddScaffoldOutput;
          expect(output.overallStatus).toBe("success");
          expect(output.summaryMessage).toBe(
            `Full agent set for '${componentName}' scaffolded successfully: 3 files created/overwritten.`
          );
          expect(output.generatedFiles).toHaveLength(3);
          expect(output.generatedFiles).toEqual(expect.arrayContaining(allFullSetPaths));
          expect(output.skippedFiles).toBeUndefined();
          expect(output.generatedFileContents).toHaveLength(3);
          for (const p of allFullSetPaths) {
            await expect(fs.access(p)).resolves.toBeUndefined();
          }
        });

        it(`[FULL_AGENT_SET] should ${
          policy === OverwritePolicy.ERROR_IF_EXISTS ? "fail" : "behave correctly"
        } when one file (agent) exists [${policy}]`, async () => {
          await createDummyFile(expectedAgentPathFull, "old agent content");

          const result = await agent.generateSddScaffold(baseInputFullSet);

          if (policy === OverwritePolicy.ERROR_IF_EXISTS) {
            expect(result.success).toBe(false);
            expect(result.result).toBeUndefined();
            expect(result.error).toBeDefined();
            expect(result.error?.category).toBe(ErrorCategory.OPERATION_FAILED);
            expect(result.error?.message).toContain(
              `Scaffolding failed: File '${expectedAgentPathFull}' already exists and overwrite policy is ${OverwritePolicy.ERROR_IF_EXISTS}.`
            );
            // Ensure no other files were created
            await expect(fs.access(expectedContractPathFull)).rejects.toThrow();
            await expect(fs.access(expectedTestPathFull)).rejects.toThrow();
            const agentContent = await fs.readFile(expectedAgentPathFull, "utf-8");
            expect(agentContent).toBe("old agent content"); // Original file untouched
          } else if (policy === OverwritePolicy.OVERWRITE) {
            expect(result.success).toBe(true);
            const output = result.result as MVPSddScaffoldOutput;
            expect(output.overallStatus).toBe("success"); // All files are (over)written
            expect(output.summaryMessage).toBe(
              `Full agent set for '${componentName}' scaffolded successfully: 3 files created/overwritten.`
            );
            expect(output.generatedFiles).toHaveLength(3);
            expect(output.generatedFiles).toEqual(expect.arrayContaining(allFullSetPaths));
            expect(output.skippedFiles).toBeUndefined();
            expect(output.generatedFileContents).toHaveLength(3);
            // Check content of overwritten file
            const agentFileDetail = output.generatedFileContents?.find(f => f.filePath === expectedAgentPathFull);
            expect(agentFileDetail?.content).toEqual(expectedAgentContent(componentName, pascalCaseName));
          } else if (policy === OverwritePolicy.SKIP) {
            expect(result.success).toBe(true);
            const output = result.result as MVPSddScaffoldOutput;
            expect(output.overallStatus).toBe("partial_success");
            expect(output.summaryMessage).toBe(
              `Full agent set for '${componentName}' scaffolded with partial success: 2 files created/overwritten, 1 files skipped.`
            );
            expect(output.generatedFiles).toHaveLength(2);
            expect(output.generatedFiles).not.toContain(expectedAgentPathFull);
            expect(output.generatedFiles).toEqual(expect.arrayContaining([expectedContractPathFull, expectedTestPathFull]));
            expect(output.skippedFiles).toEqual([expectedAgentPathFull]);
            expect(output.generatedFileContents).toHaveLength(2);
            const agentContent = await fs.readFile(expectedAgentPathFull, "utf-8");
            expect(agentContent).toBe("old agent content"); // Original file untouched
          }
        });
        
        it(`[FULL_AGENT_SET] should ${
          policy === OverwritePolicy.ERROR_IF_EXISTS ? "fail" : "behave correctly"
        } when all files exist [${policy}]`, async () => {
          await createDummyFile(expectedAgentPathFull, "old agent content");
          await createDummyFile(expectedContractPathFull, "old contract content");
          await createDummyFile(expectedTestPathFull, "old test content");

          const result = await agent.generateSddScaffold(baseInputFullSet);

          if (policy === OverwritePolicy.ERROR_IF_EXISTS) {
            expect(result.success).toBe(false);
            expect(result.result).toBeUndefined();
            expect(result.error).toBeDefined();
            expect(result.error?.category).toBe(ErrorCategory.OPERATION_FAILED);
            // Error message will be for the first file it checks (agent file in this setup)
            expect(result.error?.message).toContain(
              `Scaffolding failed: File '${expectedAgentPathFull}' already exists and overwrite policy is ${OverwritePolicy.ERROR_IF_EXISTS}.`
            );
            // Ensure original files are untouched
            const agentContent = await fs.readFile(expectedAgentPathFull, "utf-8");
            expect(agentContent).toBe("old agent content");
            const contractContent = await fs.readFile(expectedContractPathFull, "utf-8");
            expect(contractContent).toBe("old contract content");
            const testContent = await fs.readFile(expectedTestPathFull, "utf-8");
            expect(testContent).toBe("old test content");

          } else if (policy === OverwritePolicy.OVERWRITE) {
            expect(result.success).toBe(true);
            const output = result.result as MVPSddScaffoldOutput;
            expect(output.overallStatus).toBe("success");
             expect(output.summaryMessage).toBe(
              `Full agent set for '${componentName}' scaffolded successfully: 3 files created/overwritten.`
            );
            expect(output.generatedFiles).toHaveLength(3);
            expect(output.generatedFiles).toEqual(expect.arrayContaining(allFullSetPaths));
            expect(output.skippedFiles).toBeUndefined();
            expect(output.generatedFileContents).toHaveLength(3);
            // Check content of overwritten files
            const agentFileDetail = output.generatedFileContents?.find(f => f.filePath === expectedAgentPathFull);
            expect(agentFileDetail?.content).toEqual(expectedAgentContent(componentName, pascalCaseName));
            const contractFileDetail = output.generatedFileContents?.find(f => f.filePath === expectedContractPathFull);
            expect(contractFileDetail?.content).toEqual(expectedContractContent(componentName, pascalCaseName));
            const testFileDetail = output.generatedFileContents?.find(f => f.filePath === expectedTestPathFull);
            expect(testFileDetail?.content).toEqual(expectedTestContent(componentName, pascalCaseName));

          } else if (policy === OverwritePolicy.SKIP) {
            expect(result.success).toBe(true); // Agent considers operation successful even if all skipped
            const output = result.result as MVPSddScaffoldOutput;
            expect(output.overallStatus).toBe("failure"); // All files skipped means overall failure for the request
            expect(output.summaryMessage).toBe(
              `Scaffolding failed for '${componentName}': All 3 target files already exist and were skipped.`
            );
            expect(output.generatedFiles).toHaveLength(0);
            expect(output.skippedFiles).toHaveLength(3);
            expect(output.skippedFiles).toEqual(expect.arrayContaining(allFullSetPaths));
            expect(output.generatedFileContents).toBeUndefined();
             // Ensure original files are untouched
            const agentContent = await fs.readFile(expectedAgentPathFull, "utf-8");
            expect(agentContent).toBe("old agent content");
            const contractContent = await fs.readFile(expectedContractPathFull, "utf-8");
            expect(contractContent).toBe("old contract content");
            const testContent = await fs.readFile(expectedTestPathFull, "utf-8");
            expect(testContent).toBe("old test content");
          }
        });

        // Removed tests for "when only contract file exists" and "when both files exist"
        // as the OverwritePolicy tests are now simplified to SddComponentType.AGENT which only creates one file.
        // If testing FULL_AGENT_SET with OverwritePolicy, those would be relevant.
        // ^^^ Re-added more comprehensive FULL_AGENT_SET tests above.
      });
    });
  });
  // --- END OverwritePolicy Integration Tests ---
});
