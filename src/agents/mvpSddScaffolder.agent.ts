// AGENT_VERSION: 0.1.0
// SDD_TARGET_CONTRACT_VERSION: 0.1.0

import * as fs from "fs/promises";
import * as path from "path";
import {
  AgentId,
  MVPSddScaffoldOutput,
  MVPSddScaffoldRequest,
  OverwritePolicy,
  SddComponentType,
} from "../contracts/mvpSddScaffolder.contract";

const AGENT_ID: AgentId = "MVPSddScaffolderAgent_v1"; // Define a constant for the agent ID

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

export class MVPSddScaffolderAgent {
  async generateSddScaffold(
    request: MVPSddScaffoldRequest
  ): Promise<MVPSddScaffoldOutput> {
    console.info(
      `[${AGENT_ID}] Received request to scaffold component: ${
        request.componentName
      }, type: ${request.sddComponentType}, policy: ${
        request.overwritePolicy || OverwritePolicy.ERROR_IF_EXISTS
      }`
    );
    // Changed return type to MVPSddScaffoldOutput directly for simplicity here, assuming ContractResult is handled by a wrapper
    const {
      componentName, // Changed from sddComponentName to componentName
      sddComponentType,
      targetDirectory,
      templateVariables = {},
      overwritePolicy = OverwritePolicy.ERROR_IF_EXISTS,
      // requestingAgentId, // Available if needed for logging or context
    } = request;

    const generatedFilePaths: string[] = [];
    const skippedFilePaths: string[] = [];
    const errorMessages: string[] = [];

    try {
      await fs.mkdir(targetDirectory, { recursive: true });
      console.info(
        `[${AGENT_ID}] Ensured target directory exists: ${targetDirectory}`
      );

      let results: Array<{
        status: "created" | "overwritten" | "skipped" | "error";
        filePath: string;
        message?: string;
      }> = [];

      if (sddComponentType === SddComponentType.FULL_AGENT_SET) {
        console.info(
          `[${AGENT_ID}] Scaffolding FULL_AGENT_SET for ${componentName}`
        );
        results = await this._scaffoldFullAgentSet(
          componentName, // Use componentName as baseName
          targetDirectory,
          templateVariables,
          overwritePolicy
        );
      } else {
        let actualOutputName = "";
        const baseSddName = componentName; // Use componentName as baseSddName
        console.info(
          `[${AGENT_ID}] Scaffolding single component type ${sddComponentType} for base name ${baseSddName}`
        );

        switch (sddComponentType) {
          case SddComponentType.AGENT:
            actualOutputName = `${baseSddName}Agent`;
            break;
          case SddComponentType.CONTRACT:
            actualOutputName = `${baseSddName}Contract`;
            break;
          case SddComponentType.TEST:
            actualOutputName = `${baseSddName}ContractTest`;
            break;
          default:
            console.error(
              `[${AGENT_ID}] Unsupported SDD component type: ${sddComponentType}`
            );
            return {
              scaffolderAgentId: AGENT_ID,
              generatedFiles: [],
              overallStatus: "failure",
              summaryMessage: `Unsupported SDD component type: ${sddComponentType}`,
            };
        }

        console.info(
          `[${AGENT_ID}] Determined actualOutputName: ${actualOutputName}, proceeding to scaffold single component.`
        );
        const singleResult = await this._scaffoldSingleComponent(
          sddComponentType,
          actualOutputName,
          targetDirectory,
          {
            ...templateVariables,
            componentName: actualOutputName,
            sddComponentName: baseSddName,
          },
          overwritePolicy
        );
        results.push(singleResult);
      }

      console.info(
        `[${AGENT_ID}] Raw scaffolding results for ${componentName}:`,
        results
      );

      let overallSuccess = true;
      results.forEach((res) => {
        if (res.status === "created" || res.status === "overwritten") {
          generatedFilePaths.push(res.filePath);
        } else if (res.status === "skipped") {
          skippedFilePaths.push(res.filePath);
        } else if (res.status === "error") {
          overallSuccess = false;
          if (res.message) errorMessages.push(res.message);
        }
      });

      let summaryMsg = "";
      let status: MVPSddScaffoldOutput["overallStatus"] = "success";

      if (!overallSuccess) {
        summaryMsg = `Scaffolding encountered errors for ${componentName}. ${errorMessages.join(
          "; "
        )}`;
        status =
          generatedFilePaths.length > 0 || skippedFilePaths.length > 0
            ? "partial_success"
            : "failure";
      } else {
        summaryMsg = `Scaffolding process completed for ${componentName}.`;
        if (generatedFilePaths.length > 0)
          summaryMsg += ` ${generatedFilePaths.length} file(s) generated/overwritten.`;
        if (skippedFilePaths.length > 0)
          summaryMsg += ` ${skippedFilePaths.length} file(s) skipped.`;
        if (
          generatedFilePaths.length === 0 &&
          skippedFilePaths.length === 0 &&
          errorMessages.length === 0
        ) {
          summaryMsg = `No files were generated or overwritten for ${componentName}. All target files may have been skipped.`;
        } else if (
          generatedFilePaths.length === 0 &&
          skippedFilePaths.length === 0 &&
          errorMessages.length > 0
        ) {
          summaryMsg = `Scaffolding failed for ${componentName}. No files generated. Errors: ${errorMessages.join(
            "; "
          )}`;
          status = "failure";
        }
      }

      console.info(
        `[${AGENT_ID}] Finalizing output for ${componentName}: Status: ${status}, Summary: ${summaryMsg}`
      );
      return {
        scaffolderAgentId: AGENT_ID,
        generatedFiles: generatedFilePaths, // Always return an array
        overallStatus: status,
        summaryMessage: summaryMsg,
      };
    } catch (error: any) {
      console.error(
        `[${AGENT_ID}] Unexpected error during scaffolding for ${componentName}:`,
        error
      );
      return {
        scaffolderAgentId: AGENT_ID,
        generatedFiles: [],
        overallStatus: "failure",
        summaryMessage: `Unexpected error during scaffolding for ${componentName}: ${error.message}`,
      };
    }
  }

  private async _scaffoldFullAgentSet(
    baseName: string,
    baseTargetDirectory: string,
    templateVariables: Record<string, string>,
    overwritePolicy: OverwritePolicy
  ): Promise<
    Array<{
      status: "created" | "overwritten" | "skipped" | "error";
      filePath: string;
      message?: string;
    }>
  > {
    console.info(
      `[${AGENT_ID}] _scaffoldFullAgentSet called for baseName: ${baseName}`
    );
    const results: Array<{
      status: "created" | "overwritten" | "skipped" | "error";
      filePath: string;
      message?: string;
    }> = [];
    const agentName = `${baseName}Agent`;
    const contractName = `${baseName}Contract`;
    const testName = `${baseName}ContractTest`;

    const agentDir = path.join(baseTargetDirectory, "agents");
    const contractDir = path.join(baseTargetDirectory, "contracts");
    const testDir = path.join(baseTargetDirectory, "tests");

    console.info(
      `[${AGENT_ID}] Scaffolding AGENT component: ${agentName} in ${agentDir}`
    );
    results.push(
      await this._scaffoldSingleComponent(
        SddComponentType.AGENT,
        agentName,
        agentDir,
        {
          ...templateVariables,
          componentName: agentName,
          sddComponentName: baseName,
        },
        overwritePolicy
      )
    );

    console.info(
      `[${AGENT_ID}] Scaffolding CONTRACT component: ${contractName} in ${contractDir}`
    );
    results.push(
      await this._scaffoldSingleComponent(
        SddComponentType.CONTRACT,
        contractName,
        contractDir,
        {
          ...templateVariables,
          componentName: contractName,
          sddComponentName: baseName,
        },
        overwritePolicy
      )
    );

    console.info(
      `[${AGENT_ID}] Scaffolding TEST component: ${testName} in ${testDir}`
    );
    results.push(
      await this._scaffoldSingleComponent(
        SddComponentType.TEST,
        testName,
        testDir,
        {
          ...templateVariables,
          componentName: testName,
          sddComponentName: baseName,
          contractToTest: contractName,
        },
        overwritePolicy
      )
    );
    console.info(
      `[${AGENT_ID}] _scaffoldFullAgentSet completed for baseName: ${baseName}`
    );
    return results;
  }

  private async _scaffoldSingleComponent(
    componentType: SddComponentType,
    componentName: string,
    targetDirectory: string,
    templateVariables: Record<string, string>, // Type is already Record<string, string>
    overwritePolicy: OverwritePolicy
  ): Promise<{
    status: "created" | "overwritten" | "skipped" | "error";
    filePath: string;
    message?: string;
  }> {
    console.info(
      `[${AGENT_ID}] _scaffoldSingleComponent called for type: ${componentType}, name: ${componentName}, dir: ${targetDirectory}`
    );
    let templateFileName = "";
    let outputFileName = "";
    const sddTypeNameForComment = componentType.toString();

    switch (componentType) {
      case SddComponentType.AGENT:
        templateFileName = "agent.ts.tpl";
        outputFileName = `${componentName}.ts`;
        break;
      case SddComponentType.CONTRACT:
        templateFileName = "contract.ts.tpl";
        outputFileName = `${componentName}.ts`;
        break;
      case SddComponentType.TEST:
        templateFileName = "test.ts.tpl";
        outputFileName = `${componentName}.test.ts`;
        break;
      default:
        console.error(
          `[${AGENT_ID}] Unsupported SDD component type in _scaffoldSingleComponent: ${componentType}`
        );
        return {
          status: "error",
          filePath: targetDirectory,
          message: `Unsupported SDD component type: ${componentType}`,
        };
    }

    const templateFilePath = path.join(TEMPLATE_DIR, templateFileName);
    const outputFilePath = path.join(targetDirectory, outputFileName);
    console.info(
      `[${AGENT_ID}] Template path: ${templateFilePath}, Output path: ${outputFilePath}`
    );

    try {
      await fs.mkdir(targetDirectory, { recursive: true });
      console.info(
        `[${AGENT_ID}] Ensured directory for single component: ${targetDirectory}`
      );

      let fileExists = false;
      try {
        console.info(`[${AGENT_ID}] Checking existence of ${outputFilePath}`);
        await fs.stat(outputFilePath);
        fileExists = true;
        console.info(`[${AGENT_ID}] File ${outputFilePath} exists.`);
      } catch (e: any) {
        if (e.code !== "ENOENT") {
          console.error(
            `[${AGENT_ID}] Error checking file existence for ${outputFilePath}: ${e.message}`
          );
          return {
            status: "error",
            filePath: outputFilePath,
            message: `Error checking file status for ${outputFilePath}: ${e.message}`,
          };
        }
      }

      if (fileExists) {
        console.info(
          `[${AGENT_ID}] File ${outputFilePath} exists. Applying overwritePolicy: ${overwritePolicy}`
        );
        if (overwritePolicy === OverwritePolicy.ERROR_IF_EXISTS) {
          console.error(
            `[${AGENT_ID}] Error: File ${outputFilePath} already exists. Operation aborted due to OverwritePolicy.ERROR_IF_EXISTS.`
          );
          return {
            status: "error",
            filePath: outputFilePath,
            message: `File ${outputFilePath} already exists. Overwrite policy is '${OverwritePolicy.ERROR_IF_EXISTS}'.`,
          };
        } else if (overwritePolicy === OverwritePolicy.SKIP) {
          console.log(
            `[${AGENT_ID}] Skipping existing file due to OverwritePolicy.SKIP: ${outputFilePath}`
          );
          return {
            status: "skipped",
            filePath: outputFilePath,
            message: `File ${outputFilePath} already exists and was skipped.`,
          };
        }
      }

      console.info(`[${AGENT_ID}] Reading template file: ${templateFilePath}`);
      let templateContent = await fs.readFile(templateFilePath, "utf-8");

      // Ensure sddComponentName (base name) and componentName (derived full name) are available
      const effectiveSddComponentName =
        templateVariables.sddComponentName ||
        componentName.replace(/(Agent|Contract|Test)$/, "");
      // Make allTemplateVars explicitly Record<string, string> to satisfy the index signature for the loop
      const allTemplateVars: Record<string, string> = {
        ...templateVariables,
        sddComponentName: effectiveSddComponentName,
        componentName: componentName,
      };
      console.info(
        `[${AGENT_ID}] Populating template with variables:`,
        allTemplateVars
      );

      for (const key in allTemplateVars) {
        const regex = new RegExp(`{{${key}}}`, "g");
        templateContent = templateContent.replace(regex, allTemplateVars[key]);
      }
      // Fallbacks, though explicit passing in allTemplateVars is preferred.
      templateContent = templateContent.replace(
        /{{sddComponentName}}/g,
        effectiveSddComponentName
      );
      templateContent = templateContent.replace(
        /{{componentName}}/g,
        componentName
      );

      const blueprintComment = SDD_BLUEPRINT_COMMENT(
        effectiveSddComponentName,
        sddTypeNameForComment
      );
      const finalContent = `${blueprintComment}\n${templateContent}`;
      console.info(`[${AGENT_ID}] Writing final content to ${outputFilePath}`);

      await fs.writeFile(outputFilePath, finalContent);

      if (fileExists) {
        console.info(`Successfully overwrote existing file: ${outputFilePath}`);
      } else {
        console.info(`Successfully created file: ${outputFilePath}`);
      }

      return {
        status: fileExists ? "overwritten" : "created",
        filePath: outputFilePath,
        message: `File ${outputFilePath} ${
          fileExists ? "overwritten" : "created"
        } successfully.`,
      };
    } catch (error: any) {
      console.error(
        `[${AGENT_ID}] Error in _scaffoldSingleComponent for ${componentName} (${outputFilePath}):`,
        error
      );
      return {
        status: "error",
        filePath: outputFilePath,
        message: `Error processing ${componentType} '${componentName}' for path ${outputFilePath}: ${error.message}`,
      };
    }
  }
}
