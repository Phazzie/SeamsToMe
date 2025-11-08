import * as fs from "fs/promises";
import * as path from "path";
import {
  IMVPSddScaffolderAgent,
  MVPSddScaffoldOutput,
  MVPSddScaffoldRequest,
  OverwritePolicy,
  SddComponentType,
} from "../contracts/mvpSddScaffolder.contract";
import { AgentError, ContractResult, ErrorCategory, failure, success } from "../contracts/types";
import { BaseAgent } from "./base.agent";
import { safePathJoin, validateComponentName } from "../utils/pathValidation";

/**
 * MVPSddScaffolderAgent
 * Fresh minimal implementation to identify real contract requirements
 */
export class MVPSddScaffolderAgent extends BaseAgent implements IMVPSddScaffolderAgent {
  protected readonly agentId = "MVPSddScaffolderAgent";
  async generateSddScaffold(
    request: MVPSddScaffoldRequest
  ): Promise<ContractResult<MVPSddScaffoldOutput, AgentError>> {
    return this.withErrorHandling(async () => {
      // Validate required fields
      if (!this.validateNonEmpty(request.componentName, "Component name", request.requestingAgentId)) {
        return failure(
          this.createValidationError("Component name", "Component name cannot be empty", request.requestingAgentId)
        );
      }

      if (!this.validateNonEmpty(request.targetDirectory, "Target directory", request.requestingAgentId)) {
        return failure(
          this.createValidationError("Target directory", "Target directory cannot be empty", request.requestingAgentId)
        );
      }

      // Validate component type
      const validTypes = Object.values(SddComponentType);
      if (!validTypes.includes(request.sddComponentType)) {
        return failure(
          this.createError(
            `Unknown SDD component type: ${request.sddComponentType}`,
            ErrorCategory.VALIDATION_ERROR,
            "ValidationError",
            request.requestingAgentId
          )
        );
      }

      // Validate inputs for security - prevent path traversal attacks
      const pathResult = safePathJoin(request.targetDirectory, request.componentName);
      if (!pathResult.success) {
        return failure(pathResult.error);
      }
      const componentDir = pathResult.result;

      const generatedFiles: string[] = [];
      const generatedFileContents: Array<{
        filePath: string;
        content: string;
      }> = [];

      // Handle different component types
      if (request.sddComponentType === SddComponentType.AGENT) {
        const result = await this.generateAgentFiles(request, componentDir);
        if (!result.success) return result;
        generatedFiles.push(...result.result.files);
        generatedFileContents.push(...result.result.contents);
      } else if (request.sddComponentType === SddComponentType.FULL_AGENT_SET) {
        const result = await this.generateFullAgentSet(request, componentDir);
        if (!result.success) return result;
        generatedFiles.push(...result.result.files);
        generatedFileContents.push(...result.result.contents);
      } else if (request.sddComponentType === SddComponentType.CONTRACT) {
        const result = await this.generateContractFile(request, componentDir);
        if (!result.success) return result;
        generatedFiles.push(...result.result.files);
        generatedFileContents.push(...result.result.contents);
      } else if (request.sddComponentType === SddComponentType.TEST) {
        const result = await this.generateTestFile(request, componentDir);
        if (!result.success) return result;
        generatedFiles.push(...result.result.files);
        generatedFileContents.push(...result.result.contents);
      }

      // Generate appropriate summary message based on component type
      let summaryMessage: string;
      switch (request.sddComponentType) {
        case SddComponentType.AGENT:
          summaryMessage = `Successfully scaffolded basic agent and contract files for ${request.componentName}`;
          break;
        case SddComponentType.FULL_AGENT_SET:
          summaryMessage = `Successfully scaffolded full agent set for ${request.componentName}`;
          break;
        case SddComponentType.CONTRACT:
          summaryMessage = `Successfully scaffolded contract file for ${request.componentName}`;
          break;
        case SddComponentType.TEST:
          summaryMessage = `Successfully scaffolded test file for ${request.componentName}`;
          break;
        default:
          summaryMessage = `Successfully scaffolded ${request.componentName}`;
      }

      return success({
        scaffolderAgentId: "MVPSddScaffolderAgent",
        generatedFiles,
        overallStatus: "success",
        summaryMessage,
        generatedFileContents,
        targetDirectory: request.targetDirectory,
        componentName: request.componentName,
        sddComponentType: request.sddComponentType,
      });
    }, "generateSddScaffold", request.requestingAgentId);
  }

  private async generateAgentFiles(
    request: MVPSddScaffoldRequest,
    componentDir: string
  ): Promise<ContractResult<{ files: string[]; contents: Array<{ filePath: string; content: string }> }>> {
    // Validate component name for security
    const nameValidation = validateComponentName(request.componentName);
    if (!nameValidation.success) {
      return failure(nameValidation.error);
    }
    const safeName = nameValidation.result;

    const agentFilePath = path.join(
      componentDir,
      `${safeName}.agent.ts`
    );
    const contractFilePath = path.join(
      componentDir,
      `${safeName}.contract.ts`
    );

    const overwritePolicy = request.overwritePolicy || OverwritePolicy.ERROR_IF_EXISTS;

    // Generate content
    const agentContent = this.substituteTemplate(
      `/**
 * {{componentName}} Agent
 */

export class {{componentName}}Agent {
  // Placeholder for {{componentName}}Agent
  // Custom: {{customVar}}Custom
}`,
      safeName,
      request.templateVariables
    );

    const contractContent = this.substituteTemplate(
      `/**
 * {{componentName}} Contract
 */

export interface I{{componentName}}Agent {
  // Contract for {{componentName}}
  // Custom: {{customVar}}Custom
}`,
      safeName,
      request.templateVariables
    );

    // Create directory
    try {
      await fs.mkdir(componentDir, { recursive: true });
    } catch (error: any) {
      return failure(
        this.createOperationError("create directory", error, request.requestingAgentId)
      );
    }

    // Handle writing based on policy - write files one at a time
    const filesToWrite = [
      { path: agentFilePath, content: agentContent },
      { path: contractFilePath, content: contractContent }
    ];

    for (const file of filesToWrite) {
      // Check file existence based on policy
      if (overwritePolicy === OverwritePolicy.ERROR_IF_EXISTS) {
        const checkResult = await this.checkFileExists(file.path, request.requestingAgentId);
        if (!checkResult.success) return checkResult;
      } else if (overwritePolicy === OverwritePolicy.SKIP) {
        // Check if file exists, skip if it does
        try {
          await fs.stat(file.path);
          // File exists, skip it
          continue;
        } catch (error: any) {
          if (error.code !== "ENOENT") {
            return failure(
              this.createOperationError("check file", error, request.requestingAgentId)
            );
          }
          // File doesn't exist, write it
        }
      }
      // For OVERWRITE, don't check, just write

      // Write the file
      try {
        await fs.writeFile(file.path, file.content);
      } catch (error: any) {
        return failure(
          this.createOperationError("write file", error, request.requestingAgentId)
        );
      }
    }

    return success({
      files: [agentFilePath, contractFilePath],
      contents: [
        { filePath: agentFilePath, content: agentContent },
        { filePath: contractFilePath, content: contractContent },
      ],
    });
  }

  private async generateFullAgentSet(
    request: MVPSddScaffoldRequest,
    componentDir: string
  ): Promise<ContractResult<{ files: string[]; contents: Array<{ filePath: string; content: string }> }>> {
    // Validate component name for security
    const nameValidation = validateComponentName(request.componentName);
    if (!nameValidation.success) {
      return failure(nameValidation.error);
    }
    const safeName = nameValidation.result;

    const agentFilePath = path.join(
      componentDir,
      `${safeName}.agent.ts`
    );
    const contractFilePath = path.join(
      componentDir,
      `${safeName}.contract.ts`
    );
    const testFilePath = path.join(
      componentDir,
      `${safeName}.contract.test.ts`
    );

    // Check for existing files if overwrite policy is ERROR_IF_EXISTS
    const overwritePolicy = request.overwritePolicy || OverwritePolicy.ERROR_IF_EXISTS;
    if (overwritePolicy === OverwritePolicy.ERROR_IF_EXISTS) {
      const checkResult = await this.checkFileExists(agentFilePath, request.requestingAgentId);
      if (!checkResult.success) return checkResult;
      const checkResult2 = await this.checkFileExists(contractFilePath, request.requestingAgentId);
      if (!checkResult2.success) return checkResult2;
      const checkResult3 = await this.checkFileExists(testFilePath, request.requestingAgentId);
      if (!checkResult3.success) return checkResult3;
    }

    // Generate content for all three files with proper template substitution
    const agentContent = this.substituteTemplate(
      `/**
 * {{componentName}} Agent
 */

export class {{componentName}}Agent {
  // Placeholder for {{componentName}}Agent
  // Custom: {{customVar}}Custom
}`,
      safeName,
      request.templateVariables
    );

    const contractContent = this.substituteTemplate(
      `/**
 * {{componentName}} Contract
 */

export interface I{{componentName}}Agent {
  // Contract for {{componentName}}
  // Custom: {{customVar}}Custom
}`,
      safeName,
      request.templateVariables
    );

    const testContent = this.substituteTemplate(
      `/**
 * {{componentName}} Contract Test
 */

describe("{{componentName}}Agent Contract Tests", () => {
  // Contract test for {{componentName}}
  // Custom: {{customVar}}Custom
});`,
      safeName,
      request.templateVariables
    );

    // Create directory and write files
    try {
      await fs.mkdir(componentDir, { recursive: true });
      await fs.writeFile(agentFilePath, agentContent);
      await fs.writeFile(contractFilePath, contractContent);
      await fs.writeFile(testFilePath, testContent);
    } catch (error: any) {
      return failure(
        this.createOperationError(
          "write files",
          error,
          request.requestingAgentId
        )
      );
    }

    return success({
      files: [agentFilePath, contractFilePath, testFilePath],
      contents: [
        { filePath: agentFilePath, content: agentContent },
        { filePath: contractFilePath, content: contractContent },
        { filePath: testFilePath, content: testContent },
      ],
    });
  }

  private async generateContractFile(
    request: MVPSddScaffoldRequest,
    componentDir: string
  ): Promise<ContractResult<{ files: string[]; contents: Array<{ filePath: string; content: string }> }>> {
    // Validate component name for security
    const nameValidation = validateComponentName(request.componentName);
    if (!nameValidation.success) {
      return failure(nameValidation.error);
    }
    const safeName = nameValidation.result;

    const contractFilePath = path.join(
      componentDir,
      `${safeName}.contract.ts`
    );

    // Check for existing files if overwrite policy is ERROR_IF_EXISTS
    const overwritePolicy = request.overwritePolicy || OverwritePolicy.ERROR_IF_EXISTS;
    if (overwritePolicy === OverwritePolicy.ERROR_IF_EXISTS) {
      const checkResult = await this.checkFileExists(contractFilePath, request.requestingAgentId);
      if (!checkResult.success) return checkResult;
    }

    const contractContent = this.substituteTemplate(
      `/**
 * {{componentName}} Contract
 */

export interface I{{componentName}}Agent {
  // Contract for {{componentName}}
  // Custom: {{customVar}}Custom
}`,
      safeName,
      request.templateVariables
    );

    // Create directory and write files
    try {
      await fs.mkdir(componentDir, { recursive: true });
      await fs.writeFile(contractFilePath, contractContent);
    } catch (error: any) {
      return failure(
        this.createOperationError(
          "write files",
          error,
          request.requestingAgentId
        )
      );
    }

    return success({
      files: [contractFilePath],
      contents: [{ filePath: contractFilePath, content: contractContent }],
    });
  }

  private async generateTestFile(
    request: MVPSddScaffoldRequest,
    componentDir: string
  ): Promise<ContractResult<{ files: string[]; contents: Array<{ filePath: string; content: string }> }>> {
    // Validate component name for security
    const nameValidation = validateComponentName(request.componentName);
    if (!nameValidation.success) {
      return failure(nameValidation.error);
    }
    const safeName = nameValidation.result;

    const testFilePath = path.join(
      componentDir,
      `${safeName}.contract.test.ts`
    );

    // Check for existing files if overwrite policy is ERROR_IF_EXISTS
    const overwritePolicy = request.overwritePolicy || OverwritePolicy.ERROR_IF_EXISTS;
    if (overwritePolicy === OverwritePolicy.ERROR_IF_EXISTS) {
      const checkResult = await this.checkFileExists(testFilePath, request.requestingAgentId);
      if (!checkResult.success) return checkResult;
    }

    const testContent = this.substituteTemplate(
      `/**
 * {{componentName}} Contract Test
 */

describe("{{componentName}}Agent Contract Tests", () => {
  // Contract test for {{componentName}}
  // Custom: {{customVar}}Custom
});`,
      safeName,
      request.templateVariables
    );

    // Create directory and write files
    try {
      await fs.mkdir(componentDir, { recursive: true });
      await fs.writeFile(testFilePath, testContent);
    } catch (error: any) {
      return failure(
        this.createOperationError(
          "write files",
          error,
          request.requestingAgentId
        )
      );
    }

    return success({
      files: [testFilePath],
      contents: [{ filePath: testFilePath, content: testContent }],
    });
  }

  private async checkFileExists(
    filePath: string,
    requestingAgentId?: string
  ): Promise<ContractResult<void>> {
    try {
      await fs.stat(filePath);
      return failure(
        this.createError(
          `File ${filePath} already exists. OverwritePolicy is ERROR_IF_EXISTS.`,
          ErrorCategory.FILE_SYSTEM_ERROR,
          "FileExistsError",
          requestingAgentId
        )
      );
    } catch (error: any) {
      if (error.code !== "ENOENT") {
        return failure(
          this.createOperationError(
            "check file existence",
            error,
            requestingAgentId
          )
        );
      }
    }
    return success(undefined);
  }

  /**
   * Template substitution method that replaces variables and applies PascalCase transformation
   */
  private substituteTemplate(
    template: string,
    componentName: string,
    templateVariables?: Record<string, string>
  ): string {
    let result = template;

    // Replace component name
    result = result.replace(/{{componentName}}/g, componentName);

    // Replace template variables with PascalCase transformation
    if (templateVariables) {
      Object.entries(templateVariables).forEach(([key, value]) => {
        const pascalValue = this.toPascalCase(value);
        result = result.replace(new RegExp(`{{${key}}}`, "g"), pascalValue);
      });
    }

    return result;
  }

  /**
   * Convert string to PascalCase
   */
  private toPascalCase(str: string): string {
    return str
      .replace(/(?:^\w|[A-Z]|\b\w)/g, (word) => word.toUpperCase())
      .replace(/\s+/g, "");
  }
}
