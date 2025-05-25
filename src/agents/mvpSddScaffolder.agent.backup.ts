/**
 * MVPSddScaffolderAgent Implementation
 *
 * Purpose: Scaffolds new SDD components based on templates and user input
 * Data Flow: MVPSddScaffoldRequest → file generation → MVPSddScaffoldOutput
 * Integration: CLI calls this agent, outputs files to filesystem
 * Failure Modes: File system errors, template not found, invalid input
 * Rationale: Core functionality for SDD workflow, minimal viable implementation
 *
 * SDD: Implementation of IMVPSddScaffolderAgent contract
 */

import * as fs from "fs/promises";
import * as path from "path";
import {
  IMVPSddScaffolderAgent,
  MVPSddScaffoldRequest,
  MVPSddScaffoldOutput,
  SddComponentType,
  OverwritePolicy,
  GeneratedFileDetail,
} from "../contracts/mvpSddScaffolder.contract";
import {
  AgentError,
  AgentId,
  ContractResult,
  ErrorCategory,
  success,
  failure,
} from "../contracts/types";

const AGENT_ID: AgentId = "MVPSddScaffolderAgent";

// Simple templates - inline for speed
const AGENT_TEMPLATE = `/**
 * {{ComponentName}} Agent
 *
 * Purpose: {{Purpose}}
 * Data Flow: {{DataFlow}}
 * Integration: {{Integration}}
 * Failure Modes: {{FailureModes}}
 * Rationale: {{Rationale}}
 *
 * SDD: STUB - Implements I{{ComponentName}}Agent contract
 */

import { AgentError, AgentId, ContractResult } from "../contracts/types";

const AGENT_ID: AgentId = "{{ComponentName}}Agent";

// Placeholder for {{ComponentName}}Agent
export class {{ComponentName}}Agent {
  public readonly agentId = AGENT_ID;
  
  // TODO: Implement methods from contract
  // Custom variables: {{customVar}}
}
`;

const CONTRACT_TEMPLATE = `/**
 * {{ComponentName}} Contract
 *
 * Purpose: {{Purpose}}
 * Data Flow: {{DataFlow}}
 * Integration: {{Integration}}
 * Failure Modes: {{FailureModes}}
 * Rationale: {{Rationale}}
 *
 * SDD: CONTRACT - Interface definition for {{ComponentName}}Agent
 */

import { AgentError, AgentId, ContractResult } from "./types";

// Contract for {{ComponentName}}
export interface {{ComponentName}}Request {
  requestingAgentId: AgentId;
  // TODO: Add request properties
}

export interface {{ComponentName}}Response {
  // TODO: Add response properties
  // Custom variables: {{customVar}}
}

export interface I{{ComponentName}}Agent {
  // TODO: Add methods
}
`;

const TEST_TEMPLATE = `/**
 * {{ComponentName}} Contract Test
 *
 * Purpose: Tests {{ComponentName}}Agent contract compliance
 * Data Flow: Test data → agent → assertions
 * Integration: Jest test runner
 * Failure Modes: Contract violations, assertion failures
 * Rationale: Ensures agent implements contract correctly
 *
 * SDD: SEAM TEST for {{ComponentName}}Agent
 */

import { {{ComponentName}}Agent } from "../agents/{{componentName}}.agent";

describe("{{ComponentName}}Agent Contract Tests", () => {
  let agent: {{ComponentName}}Agent;

  beforeEach(() => {
    agent = new {{ComponentName}}Agent();
  });

  test("should have correct agentId", () => {
    expect(agent.agentId).toBe("{{ComponentName}}Agent");
  });

  // TODO: Add contract compliance tests
});
`;

export class MVPSddScaffolderAgent implements IMVPSddScaffolderAgent {
  public readonly agentId = AGENT_ID;

  async generateSddScaffold(
    request: MVPSddScaffoldRequest
  ): Promise<ContractResult<MVPSddScaffoldOutput, AgentError>> {
    try {
      const { componentName, sddComponentType, targetDirectory, templateVariables = {}, overwritePolicy = OverwritePolicy.ERROR_IF_EXISTS } = request;      // Validate input
      if (!componentName) {
        return failure({
          name: "AgentError",
          agentId: AGENT_ID,
          message: "Component name cannot be empty",
          category: ErrorCategory.INVALID_REQUEST,
          methodName: "generateSddScaffold",
          details: { request },
        });
      }

      if (!targetDirectory) {
        return failure({
          name: "AgentError",
          agentId: AGENT_ID,
          message: "Target directory cannot be empty",
          category: ErrorCategory.INVALID_REQUEST,
          methodName: "generateSddScaffold",
          details: { request },
        });
      }      const generatedFiles: string[] = [];
      const generatedFileContents: GeneratedFileDetail[] = [];
      const summaryMessages: string[] = [];
      
      // Simple template substitution
      const substitute = (template: string): string => {
        let result = template;
        result = result.replace(/{{ComponentName}}/g, this.toPascalCase(componentName));
        result = result.replace(/{{componentName}}/g, this.toCamelCase(componentName));
        
        // Apply custom variables
        Object.entries(templateVariables).forEach(([key, value]) => {
          result = result.replace(new RegExp(`{{${key}}}`, 'g'), value);
        });
        
        return result;
      };

      // Helper function to handle file creation with overwrite policy
      const handleFileCreation = async (filePath: string, content: string): Promise<void> => {
        const exists = await this.fileExists(filePath);
        
        if (exists && overwritePolicy === OverwritePolicy.ERROR_IF_EXISTS) {
          throw new Error(`FILE_COLLISION:${filePath}`);
        }
        
        if (exists && overwritePolicy === OverwritePolicy.SKIP) {
          summaryMessages.push(`Skipped existing file ${filePath}`);
          return;
        }
        
        // Either file doesn't exist, or overwritePolicy is OVERWRITE
        await fs.writeFile(filePath, content, "utf-8");
        generatedFiles.push(filePath);
        generatedFileContents.push({ filePath, content });
        
        if (exists) {
          summaryMessages.push(`Overwritten ${filePath}`);
        } else {
          summaryMessages.push(`Successfully created ${filePath}`);
        }
      };      // Generate files based on type
      try {
        if (sddComponentType === SddComponentType.FULL_AGENT_SET) {
          // Generate all three files in component-specific directory
          const componentDir = path.join(targetDirectory, componentName.toLowerCase());
          const agentPath = path.join(componentDir, `${this.toPascalCase(componentName)}.agent.ts`);
          const contractPath = path.join(componentDir, `${this.toPascalCase(componentName)}.contract.ts`);
          const testPath = path.join(componentDir, `${this.toPascalCase(componentName)}.contract.test.ts`);

          await this.ensureDirectory(componentDir);

          const filesToCreate = [
            { path: agentPath, content: substitute(AGENT_TEMPLATE) },
            { path: contractPath, content: substitute(CONTRACT_TEMPLATE) },
            { path: testPath, content: substitute(TEST_TEMPLATE) },
          ];

          for (const file of filesToCreate) {
            await handleFileCreation(file.path, file.content);
          }        } else {
          // Generate single or paired files based on type in component-specific directory
          const componentDir = path.join(targetDirectory, componentName.toLowerCase());
          await this.ensureDirectory(componentDir);

          const filesToCreate: { path: string; content: string }[] = [];

          switch (sddComponentType) {
            case SddComponentType.AGENT:
              // Agent type generates both agent and contract files
              filesToCreate.push({
                path: path.join(componentDir, `${this.toPascalCase(componentName)}.agent.ts`),
                content: substitute(AGENT_TEMPLATE)
              });
              filesToCreate.push({
                path: path.join(componentDir, `${this.toPascalCase(componentName)}.contract.ts`),
                content: substitute(CONTRACT_TEMPLATE)
              });
              break;
            case SddComponentType.CONTRACT:
              filesToCreate.push({
                path: path.join(componentDir, `${this.toPascalCase(componentName)}.contract.ts`),
                content: substitute(CONTRACT_TEMPLATE)
              });
              break;
            case SddComponentType.TEST:
              filesToCreate.push({
                path: path.join(componentDir, `${this.toPascalCase(componentName)}.contract.test.ts`),
                content: substitute(TEST_TEMPLATE)
              });
              break;
            default:
              return failure({
                name: "AgentError",
                agentId: AGENT_ID,
                message: `Unknown SDD component type: ${sddComponentType}`,
                category: ErrorCategory.INVALID_REQUEST,
                methodName: "generateSddScaffold",
                details: { sddComponentType },
              });
          }

          for (const file of filesToCreate) {
            await handleFileCreation(file.path, file.content);
          }
        }
      } catch (error: any) {
        if (error.message.startsWith('FILE_COLLISION:')) {
          const filePath = error.message.replace('FILE_COLLISION:', '');
          return failure({
            name: "AgentError",
            agentId: AGENT_ID,
            message: `File ${filePath} already exists. OverwritePolicy is ERROR_IF_EXISTS.`,
            category: ErrorCategory.FILE_SYSTEM_ERROR,
            methodName: "generateSddScaffold",
            details: { path: filePath },
          });
        }
        throw error; // Re-throw other errors
      }      return success({
        scaffolderAgentId: AGENT_ID,
        generatedFiles,
        generatedFileContents,
        overallStatus: "success" as const,
        summaryMessage: this.generateSummaryMessage(sddComponentType, componentName, summaryMessages),
        targetDirectory,
        componentName,
        sddComponentType,
      });

    } catch (error: any) {
      return failure({
        name: "AgentError",
        agentId: AGENT_ID,
        message: `Scaffolding failed: ${error.message}`,
        category: ErrorCategory.OPERATION_FAILED,
        methodName: "generateSddScaffold",
        details: { error: error.toString() },
      });
    }
  }

  private async ensureDirectory(dirPath: string): Promise<void> {
    await fs.mkdir(dirPath, { recursive: true });
  }
  private async fileExists(filePath: string): Promise<boolean> {
    try {
      await fs.stat(filePath);
      return true;
    } catch {
      return false;
    }
  }

  private toPascalCase(str: string): string {
    return str.replace(/(^\w|-\w)/g, (g) => g.replace(/-/, "").toUpperCase());
  }

  private toCamelCase(str: string): string {
    return str.replace(/-\w/g, (g) => g[1].toUpperCase());
  }

  private generateSummaryMessage(sddComponentType: SddComponentType, componentName: string, detailedMessages: string[]): string {
    // Check if we have skip/overwrite operations
    const hasSkips = detailedMessages.some(msg => msg.includes('Skipped'));
    const hasOverwrites = detailedMessages.some(msg => msg.includes('Overwritten'));
    
    // If we have detailed operations (skip/overwrite), use the detailed messages
    if (hasSkips || hasOverwrites) {
      return detailedMessages.join('. ');
    }
    
    // Otherwise, use high-level summary based on component type
    switch (sddComponentType) {
      case SddComponentType.AGENT:
        return `Successfully scaffolded basic agent and contract files for ${componentName}`;
      case SddComponentType.FULL_AGENT_SET:
        return `Successfully scaffolded agent, contract, and test files for ${componentName}`;
      case SddComponentType.CONTRACT:
        return `Successfully scaffolded contract file for ${componentName}`;
      case SddComponentType.TEST:
        return `Successfully scaffolded test file for ${componentName}`;
      default:
        return `successfully scaffolded ${componentName}`;
    }
  }
}
