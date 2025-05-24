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

export class {{ComponentName}}Agent {
  public readonly agentId = AGENT_ID;
  
  // TODO: Implement methods from contract
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

export interface {{ComponentName}}Request {
  requestingAgentId: AgentId;
  // TODO: Add request properties
}

export interface {{ComponentName}}Response {
  // TODO: Add response properties
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
      const { componentName, sddComponentType, targetDirectory, templateVariables = {}, overwritePolicy = OverwritePolicy.ERROR_IF_EXISTS } = request;

      // Validate input
      if (!componentName || !targetDirectory) {
        return failure({
          name: "AgentError",
          agentId: AGENT_ID,
          message: "componentName and targetDirectory are required",
          category: ErrorCategory.VALIDATION_ERROR,
          methodName: "generateSddScaffold",
          details: { request },
        });
      }

      const generatedFiles: string[] = [];
      const generatedFileContents: GeneratedFileDetail[] = [];
      
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

      // Generate files based on type
      if (sddComponentType === SddComponentType.FULL_AGENT_SET) {
        // Generate all three files
        const agentPath = path.join(targetDirectory, "agents", `${this.toCamelCase(componentName)}.agent.ts`);
        const contractPath = path.join(targetDirectory, "contracts", `${this.toCamelCase(componentName)}.contract.ts`);
        const testPath = path.join(targetDirectory, "tests", `${this.toCamelCase(componentName)}.contract.test.ts`);

        await this.ensureDirectory(path.dirname(agentPath));
        await this.ensureDirectory(path.dirname(contractPath));
        await this.ensureDirectory(path.dirname(testPath));

        // Check existing files
        const filesToCreate = [
          { path: agentPath, content: substitute(AGENT_TEMPLATE) },
          { path: contractPath, content: substitute(CONTRACT_TEMPLATE) },
          { path: testPath, content: substitute(TEST_TEMPLATE) },
        ];

        for (const file of filesToCreate) {
          const exists = await this.fileExists(file.path);
          if (exists && overwritePolicy === OverwritePolicy.ERROR_IF_EXISTS) {
            return failure({
              name: "AgentError",
              agentId: AGENT_ID,
              message: `File already exists: ${file.path}`,
              category: ErrorCategory.OPERATION_FAILED,
              methodName: "generateSddScaffold",
              details: { path: file.path },
            });
          }
          
          if (!exists || overwritePolicy === OverwritePolicy.OVERWRITE) {
            await fs.writeFile(file.path, file.content, "utf-8");
            generatedFiles.push(file.path);
            generatedFileContents.push({ filePath: file.path, content: file.content });
          }
        }
      } else {
        // Generate single file
        let template = "";
        let fileName = "";
        let subDir = "";

        switch (sddComponentType) {
          case SddComponentType.AGENT:
            template = AGENT_TEMPLATE;
            fileName = `${this.toCamelCase(componentName)}.agent.ts`;
            subDir = "agents";
            break;
          case SddComponentType.CONTRACT:
            template = CONTRACT_TEMPLATE;
            fileName = `${this.toCamelCase(componentName)}.contract.ts`;
            subDir = "contracts";
            break;
          case SddComponentType.TEST:
            template = TEST_TEMPLATE;
            fileName = `${this.toCamelCase(componentName)}.contract.test.ts`;
            subDir = "tests";
            break;
          default:
            return failure({
              name: "AgentError",
              agentId: AGENT_ID,
              message: `Unsupported component type: ${sddComponentType}`,
              category: ErrorCategory.VALIDATION_ERROR,
              methodName: "generateSddScaffold",
              details: { sddComponentType },
            });
        }

        const filePath = path.join(targetDirectory, subDir, fileName);
        await this.ensureDirectory(path.dirname(filePath));

        const exists = await this.fileExists(filePath);
        if (exists && overwritePolicy === OverwritePolicy.ERROR_IF_EXISTS) {
          return failure({
            name: "AgentError",
            agentId: AGENT_ID,
            message: `File already exists: ${filePath}`,
            category: ErrorCategory.OPERATION_FAILED,
            methodName: "generateSddScaffold",
            details: { path: filePath },
          });
        }

        if (!exists || overwritePolicy === OverwritePolicy.OVERWRITE) {
          const content = substitute(template);
          await fs.writeFile(filePath, content, "utf-8");
          generatedFiles.push(filePath);
          generatedFileContents.push({ filePath, content });
        }
      }

      return success({
        scaffolderAgentId: AGENT_ID,
        generatedFiles,
        generatedFileContents,
        overallStatus: "success" as const,
        summaryMessage: `Successfully scaffolded ${componentName}`,
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
      await fs.access(filePath);
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
}
