// AGENT_VERSION: 0.1.0
// SDD_TARGET_CONTRACT_VERSION: 0.1.0

import * as path from "path";
import * as fs from "fs/promises"; // Use fs/promises for async file operations

import {
  IMVPSddScaffolderAgent,
  MVPSddScaffoldRequest,
  MVPSddScaffoldOutput,
  SddComponentType,
  GeneratedFileDetail, // Import GeneratedFileDetail
  OverwritePolicy, // Import OverwritePolicy
} from "../contracts/mvpSddScaffolder.contract";
import {
  ContractResult,
  success,
  failure,
} from "../contracts/contractUtils";
import {
  AgentError,
  ErrorCategory,
  createAgentError,
  AgentId,
} from "../contracts/types";

const AGENT_ID: AgentId = "MVPSddScaffolderAgent"; // Corrected AgentId to match contract examples and added type

const TEMPLATE_DIR = path.join(__dirname, "..", "..", "templates"); // Adjust as needed

const SDD_BLUEPRINT_COMMENT = (componentName: string, componentType: string) =>
  `/**
 * @SDD_Blueprint ${componentName} (${componentType})
 * @Phase 1: Contract (Define the interface and data structures)
 * @Phase 2: Stub (Implement the simplest version to satisfy the contract)
 * @Phase 3: Test (Write tests to verify the contract and stub)
 * @Phase 4: Implement (Flesh out the functionality)
 * @Phase 5: Review (Peer review and refactor)
 * @Phase 6: Document (Update documentation)
 * @Phase 7: Deploy (Release the new component)
 */
// TODO: Implement the ${componentType} for ${componentName}
`;

export class MVPSddScaffolderAgent implements IMVPSddScaffolderAgent {
  public static readonly AGENT_ID: AgentId = "MVPSddScaffolderAgent"; // Corrected AgentId to match contract examples and added type
  private readonly logger: ILogger;
  private readonly telemetry: ITelemetry;

  constructor(logger: ILogger, telemetry: ITelemetry) {
    this.logger = logger;
    this.telemetry = telemetry;
    this.logger.info(
      `[${MVPSddScaffolderAgent.AGENT_ID}]: Agent initialized.`
    );
  }

  public async generateSddScaffold(
    request: MVPSddScaffoldRequest
  ): Promise<ContractResult<MVPSddScaffoldOutput, AgentError>> {
    const {
      componentName,
      targetDirectory,
      sddComponentType,
      requestingAgentId,
      overwritePolicy = OverwritePolicy.ERROR_IF_EXISTS, // Default to ERROR_IF_EXISTS if not provided
    } = request;
    this.logger.info(
      `[${MVPSddScaffolderAgent.AGENT_ID}]: Received request to generate scaffold for component '${componentName}' of type '${sddComponentType}' in directory '${targetDirectory}'. Policy: ${overwritePolicy}. Requesting agent: ${requestingAgentId}`
    );
    this.telemetry.trackEvent("generateSddScaffold.start", {
      componentName,
      targetDirectory,
      sddComponentType,
      requestingAgentId,
    });

    // Input Validation
    if (!componentName || !targetDirectory || !sddComponentType) {
      const error = createAgentError(
        MVPSddScaffolderAgent.AGENT_ID,
        "Missing required input: componentName, targetDirectory, or sddComponentType.",
        ErrorCategory.VALIDATION_ERROR,
        "InputValidationError",
        requestingAgentId,
        { request }
      );
      this.logger.error(
        `[${MVPSddScaffolderAgent.AGENT_ID}]: Validation error - ${error.message}`
      );
      this.telemetry.trackEvent("generateSddScaffold.failure", {
        error,
        requestingAgentId,
      });
      return failure(error);
    }

    try {
      const generatedFiles: string[] = [];
      const skippedFiles: string[] = [];
      const generatedFileContents: GeneratedFileDetail[] = []; // Initialize array for file contents
      let summaryMessage = "";
      let overallStatus: "success" | "partial_success" | "failure" = "success"; // Default to success

      if (sddComponentType === SddComponentType.FULL_AGENT_SET) {
        const result = await this._scaffoldFullAgentSet(
          componentName,
          targetDirectory,
          overwritePolicy, // Pass policy
          requestingAgentId
        );
        generatedFiles.push(...result.generated);
        skippedFiles.push(...result.skipped);
        generatedFileContents.push(...result.contents); // Add contents from full set scaffolding

        if (result.generated.length === 0 && result.skipped.length > 0) {
          overallStatus = "failure";
          summaryMessage = `Scaffolding failed for '${componentName}': All ${result.skipped.length} target files already exist and were skipped.`;
        } else if (result.skipped.length > 0) {
          overallStatus = "partial_success";
          summaryMessage = `Full agent set for '${componentName}' scaffolded with partial success: ${result.generated.length} files created/overwritten, ${result.skipped.length} files skipped.`;
        } else {
          overallStatus = "success";
          summaryMessage = `Full agent set for '${componentName}' scaffolded successfully: ${result.generated.length} files created/overwritten.`;
        }
      } else {
        const result = await this._scaffoldSingleComponent(
          componentName,
          targetDirectory,
          sddComponentType,
          overwritePolicy, // Pass policy
          requestingAgentId
        );
        if (result.generated) {
          generatedFiles.push(result.generated.filePath); // Access filePath from the result
          generatedFileContents.push(result.generated); // Add content from single component scaffolding
          summaryMessage = `Component '${componentName}' of type '${sddComponentType}' scaffolded successfully.`;
          // overallStatus remains "success"
        }
        if (result.skipped) {
          skippedFiles.push(result.skipped);
          summaryMessage = `Component '${componentName}' of type '${sddComponentType}' already exists. Skipped.`;
          overallStatus = "failure"; // If the single component was skipped, it's a failure for this specific request.
        }
        // If an error was thrown by _scaffoldSingleComponent due to ERROR_IF_EXISTS, it will be caught by the main try-catch
      }

      const output: MVPSddScaffoldOutput = {
        scaffolderAgentId: MVPSddScaffolderAgent.AGENT_ID,
        generatedFiles,
        skippedFiles: skippedFiles.length > 0 ? skippedFiles : undefined,
        generatedFileContents: generatedFileContents.length > 0 ? generatedFileContents : undefined, // Populate generatedFileContents
        summaryMessage,
        overallStatus,
        targetDirectory,
        componentName,
        sddComponentType,
      };

      this.logger.info(
        `[${MVPSddScaffolderAgent.AGENT_ID}]: ${summaryMessage}`
      );
      this.telemetry.trackEvent("generateSddScaffold.success", {
        output,
        requestingAgentId,
      });
      return success(output);
    } catch (error: any) {
      const agentError = createAgentError(
        MVPSddScaffolderAgent.AGENT_ID,
        `Failed to generate SDD scaffold: ${error.message}`,
        ErrorCategory.OPERATION_FAILED,
        "ScaffoldingError",
        requestingAgentId,
        { originalError: error }
      );
      agentError.methodName = "generateSddScaffold"; // Add methodName

      this.logger.error(
        `[${MVPSddScaffolderAgent.AGENT_ID}]: Error during scaffold generation - ${agentError.message}`,
        error
      );
      this.telemetry.trackEvent("generateSddScaffold.failure", {
        error: agentError,
        requestingAgentId,
      });
      return failure(agentError);
    }
  }

  private async _scaffoldFullAgentSet(
    componentName: string,
    baseTargetDirectory: string,
    overwritePolicy: OverwritePolicy, // Add policy parameter
    requestingAgentId?: string
  ): Promise<{ generated: string[]; skipped: string[]; contents: GeneratedFileDetail[] }> {
    this.logger.info(
      `[${MVPSddScaffolderAgent.AGENT_ID}]: Scaffolding full agent set for '${componentName}' in '${baseTargetDirectory}' with policy '${overwritePolicy}'.`
    );
    const generated: string[] = [];
    const skipped: string[] = [];
    const contents: GeneratedFileDetail[] = []; // Initialize array for file contents

    const agentDir = path.join(baseTargetDirectory, "agents");
    const contractDir = path.join(baseTargetDirectory, "contracts");
    const testDir = path.join(baseTargetDirectory, "tests");

    const filesToScaffold: Array<{
      type: SddComponentType;
      targetPathFn: (name: string) => string;
      templatePath: string;
      postCreationMessage: string;
    }> = [
      {
        type: SddComponentType.AGENT,
        targetPathFn: (name) =>
          path.join(agentDir, `${this.toCamelCase(name)}.agent.ts`),
        templatePath: path.resolve(
          __dirname,
          "../../templates/agent.template.ts"
        ), // Adjust path as needed
        postCreationMessage: "Agent file created.",
      },
      {
        type: SddComponentType.CONTRACT,
        targetPathFn: (name) =>
          path.join(contractDir, `${this.toCamelCase(name)}.contract.ts`),
        templatePath: path.resolve(
          __dirname,
          "../../templates/contract.template.ts"
        ), // Adjust path as needed
        postCreationMessage: "Contract file created.",
      },
      {
        type: SddComponentType.TEST,
        targetPathFn: (name) =>
          path.join(testDir, `${this.toCamelCase(name)}.contract.test.ts`),
        templatePath: path.resolve(
          __dirname,
          "../../templates/test.template.ts"
        ), // Adjust path as needed
        postCreationMessage: "Test file created.",
      },
    ];

    // Pre-check for ERROR_IF_EXISTS policy
    if (overwritePolicy === OverwritePolicy.ERROR_IF_EXISTS) {
      const allTargetPaths = filesToScaffold.map(f => f.targetPathFn(componentName));
      for (const p of allTargetPaths) {
        if (await this._checkFileExists(p)) {
          throw createAgentError(
            MVPSddScaffolderAgent.AGENT_ID,
            `Scaffolding failed: File '${p}' already exists and overwrite policy is ${OverwritePolicy.ERROR_IF_EXISTS}.`,
            ErrorCategory.OPERATION_FAILED, // Or VALIDATION_ERROR
            "FileExistsError",
            requestingAgentId,
            { componentName, targetPath: p, policy: overwritePolicy }
          );
        }
      }
    }

    await fs.mkdir(agentDir, { recursive: true }); // Use fs.mkdir directly from fs/promises
    await fs.mkdir(contractDir, { recursive: true });
    await fs.mkdir(testDir, { recursive: true });

    for (const file of filesToScaffold) {
      const targetPath = file.targetPathFn(componentName);
      if (await this._checkFileExists(targetPath)) {
        if (overwritePolicy === OverwritePolicy.SKIP) {
          this.logger.warn(
            `[${MVPSddScaffolderAgent.AGENT_ID}]: File '${targetPath}' already exists. Skipping due to policy '${overwritePolicy}'.`
          );
          skipped.push(targetPath);
          continue; // Skip to next file
        }
        // If policy is OVERWRITE, we fall through to _copyAndRenameTemplate
        // If policy was ERROR_IF_EXISTS, we would have thrown an error earlier.
        this.logger.info(
          `[${MVPSddScaffolderAgent.AGENT_ID}]: File '${targetPath}' already exists. Overwriting due to policy '${overwritePolicy}'.`
        );
      }
      // If file doesn't exist OR policy is OVERWRITE
      const fileContent = await this._copyAndRenameTemplate( // Capture content
        file.templatePath,
        targetPath,
        componentName,
        file.type,
        requestingAgentId
      );
      generated.push(targetPath);
      contents.push({ filePath: targetPath, content: fileContent }); // Store filePath and content
    }
    return { generated, skipped, contents }; // Return contents
  }

  private async _scaffoldSingleComponent(
    componentName: string,
    baseTargetDirectory: string,
    componentType: SddComponentType,
    overwritePolicy: OverwritePolicy, // Add policy parameter
    requestingAgentId?: string
  ): Promise<{ generated?: GeneratedFileDetail; skipped?: string }> {
    this.logger.info(
      `[${MVPSddScaffolderAgent.AGENT_ID}]: Scaffolding single component '${componentName}' of type '${componentType}' in '${baseTargetDirectory}' with policy '${overwritePolicy}'.`
    );

    let templatePath = "";
    let targetPath = "";
    const componentDir = path.join(baseTargetDirectory, this.toCamelCase(componentName)); // Create a subdirectory for the component

    await fs.mkdir(componentDir, { recursive: true }); // Use fs.mkdir directly from fs/promises


    switch (componentType) {
      case SddComponentType.AGENT:
        templatePath = path.resolve(
          __dirname,
          "../../templates/agent.template.ts"
        ); // Adjust
        targetPath = path.join(
          componentDir,
          `${this.toCamelCase(componentName)}.agent.ts`
        );
        break;
      case SddComponentType.CONTRACT:
        templatePath = path.resolve(
          __dirname,
          "../../templates/contract.template.ts"
        ); // Adjust
        targetPath = path.join(
          componentDir,
          `${this.toCamelCase(componentName)}.contract.ts`
        );
        break;
      case SddComponentType.TEST:
        templatePath = path.resolve(
          __dirname,
          "../../templates/test.template.ts"
        ); // Adjust
        targetPath = path.join(
          componentDir,
          `${this.toCamelCase(componentName)}.contract.test.ts`
        );
        break;
      default:
        const error = createAgentError(
          MVPSddScaffolderAgent.AGENT_ID,
          `Unsupported component type: ${componentType}`,
          ErrorCategory.VALIDATION_ERROR,
          "UnsupportedComponentTypeError",
          requestingAgentId,
          { componentType }
        );
        error.methodName = "_scaffoldSingleComponent";
        this.logger.error(`[${MVPSddScaffolderAgent.AGENT_ID}]: ${error.message}`);
        throw error; // Propagate error to be caught by the main handler
    }

    if (await this._checkFileExists(targetPath)) {
      if (overwritePolicy === OverwritePolicy.ERROR_IF_EXISTS) {
        this.logger.error(
          `[${MVPSddScaffolderAgent.AGENT_ID}]: File '${targetPath}' already exists. Erroring due to policy '${OverwritePolicy.ERROR_IF_EXISTS}'.`
        );
        throw createAgentError(
          MVPSddScaffolderAgent.AGENT_ID,
          `Scaffolding failed: File '${targetPath}' already exists and overwrite policy is ${OverwritePolicy.ERROR_IF_EXISTS}.`,
          ErrorCategory.OPERATION_FAILED, // Or VALIDATION_ERROR
          "FileExistsError",
          requestingAgentId,
          { componentName, targetPath, policy: overwritePolicy }
        );
      } else if (overwritePolicy === OverwritePolicy.SKIP) {
        this.logger.warn(
          `[${MVPSddScaffolderAgent.AGENT_ID}]: File '${targetPath}' already exists. Skipping due to policy '${OverwritePolicy.SKIP}'.`
        );
        return { skipped: targetPath };
      }
      // If policy is OVERWRITE, fall through to _copyAndRenameTemplate
      this.logger.info(
        `[${MVPSddScaffolderAgent.AGENT_ID}]: File '${targetPath}' already exists. Overwriting due to policy '${OverwritePolicy.OVERWRITE}'.`
      );
    }
    
    // If file doesn't exist OR policy is OVERWRITE
    const fileContent = await this._copyAndRenameTemplate( // Capture content
      templatePath,
      targetPath,
      componentName,
      componentType,
      requestingAgentId
    );
    return { generated: { filePath: targetPath, content: fileContent } }; // Return filePath and content
  }

  private async _copyAndRenameTemplate(
    templatePath: string,
    targetPath: string,
    componentName: string,
    componentType: SddComponentType,
    requestingAgentId?: string
  ): Promise<string> { // Update return type to string (content)
    try {
      this.logger.info(
        `[${MVPSddScaffolderAgent.AGENT_ID}]: Copying template from '${templatePath}' to '${targetPath}'.`
      );
      let content = await fs.readFile(templatePath, "utf-8"); // Use fs.readFile directly

      // Replace placeholders (case-insensitive)
      content = content.replace(/{{ComponentName}}/gi, this.toPascalCase(componentName));
      content = content.replace(/{{componentName}}/gi, this.toCamelCase(componentName));
      // Add more replacements if needed, e.g., for specific type strings

      await fs.writeFile(targetPath, content); // Use fs.writeFile directly
      this.logger.info(
        `[${MVPSddScaffolderAgent.AGENT_ID}]: Successfully created file '${targetPath}'.`
      );
      this.telemetry.trackEvent("templateCopied", {
        templatePath,
        targetPath,
        componentName,
        componentType,
        requestingAgentId,
      });
      return content; // Return the content of the file
    } catch (error: any) {
      const agentError = createAgentError(
        MVPSddScaffolderAgent.AGENT_ID,
        `Failed to copy and rename template: ${error.message}`,
        ErrorCategory.FILE_SYSTEM_ERROR, // More specific error
        "TemplateCopyError",
        requestingAgentId,
        { templatePath, targetPath, originalError: error }
      );
      agentError.methodName = "_copyAndRenameTemplate";
      this.logger.error(
        `[${MVPSddScaffolderAgent.AGENT_ID}]: Error in _copyAndRenameTemplate - ${agentError.message}`,
        error
      );
      throw agentError; // Re-throw to be handled by the caller
    }
  }

  private async _checkFileExists(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath, fs.constants.F_OK); // fs.constants.F_OK is fine with fs/promises
      return true;
    } catch (error) {
      return false;
    }
  }

  // Helper function to convert to PascalCase
  private toPascalCase(str: string): string {
    return str.replace(/(^\w|-\w)/g, (g) => g.replace(/-/, "").toUpperCase());
  }

  // Helper function to convert to camelCase
  private toCamelCase(str: string): string {
    return str.replace(/-\w/g, (g) => g[1].toUpperCase());
  }
}

// Example Usage (for testing purposes, remove or comment out in production)
/*
async function testScaffolding() {
    const logger: ILogger = {
        info: console.log,
        warn: console.warn,
        error: console.error,
        debug: console.log,
    };
    const telemetry: ITelemetry = {
        trackEvent: (eventName, properties) => {
            console.log(`TELEMETRY: ${eventName}`, properties);
        },
    };

    const agent = new MVPSddScaffolderAgent(logger, telemetry);

    // Test 1: Scaffold a full agent set
    const requestFull: MVPSddScaffoldRequest = {
        componentName: "new-test-agent",
        targetDirectory: "./generated-scaffold", // Adjust path as needed
        sddComponentType: SddComponentType.FULL_AGENT_SET,
        requestingAgentId: "TestRunnerAgent",
    };
    console.log("\\n--- Testing Full Agent Set Scaffolding ---");
    let resultFull = await agent.generateSddScaffold(requestFull);
    console.log("Result (Full):", JSON.stringify(resultFull, null, 2));

    // Test 2: Scaffold a single agent
    const requestSingleAgent: MVPSddScaffoldRequest = {
        componentName: "another-agent",
        targetDirectory: "./generated-scaffold", // Adjust path as needed
        sddComponentType: SddComponentType.AGENT,
        requestingAgentId: "TestRunnerAgent",
    };
    console.log("\\n--- Testing Single Agent Scaffolding ---");
    let resultSingleAgent = await agent.generateSddScaffold(requestSingleAgent);
    console.log("Result (Single Agent):", JSON.stringify(resultSingleAgent, null, 2));

    // Test 3: Attempt to scaffold existing full agent set (should skip)
    console.log("\\n--- Testing Full Agent Set Scaffolding (Existing) ---");
    resultFull = await agent.generateSddScaffold(requestFull); // Rerun
    console.log("Result (Full - Existing):", JSON.stringify(resultFull, null, 2));

     // Test 4: Scaffold a contract into a different directory
    const requestContract: MVPSddScaffoldRequest = {
        componentName: "data-processor",
        targetDirectory: "./generated-scaffold/custom-contracts", // Adjust path as needed
        sddComponentType: SddComponentType.CONTRACT,
        requestingAgentId: "TestRunnerAgent",
    };
    console.log("\\n--- Testing Single Contract Scaffolding (Custom Dir) ---");
    let resultContract = await agent.generateSddScaffold(requestContract);
    console.log("Result (Single Contract):", JSON.stringify(resultContract, null, 2));


    // Test 5: Input validation error
    const requestInvalid: MVPSddScaffoldRequest = {
        componentName: "", // Invalid
        targetDirectory: "./generated-scaffold",
        sddComponentType: SddComponentType.AGENT,
        requestingAgentId: "TestRunnerAgent",
    };
    console.log("\\n--- Testing Input Validation Error ---");
    const resultInvalid = await agent.generateSddScaffold(requestInvalid);
    console.log("Result (Invalid Input):", JSON.stringify(resultInvalid, null, 2));
}

// testScaffolding().catch(console.error);
*/

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

// Node.js built-in modules are imported at the top now
// import * as fs from "fs";
// import * as path from "path";
// Make sure to install 'fs-extra' if you use its advanced features,
// otherwise, stick to Node.js 'fs' module for basic operations.
// For this example, we'll use the built-in 'fs' module.
