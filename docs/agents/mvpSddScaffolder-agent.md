# Agent Design Document: MVPSddScaffolderAgent

## Agent Name

MVPSddScaffolderAgent

## Purpose

This agent is responsible for scaffolding the basic file structure for new Seam Driven Development (SDD) components. It automates the creation of initial agent, contract, and test files based on user-provided inputs, facilitating a quicker start to developing new agents or agent features.

## Inputs

- `componentName`: The name of the component to be scaffolded (e.g., "MyNewAgent"). This will be used to name files and potentially internal class/interface names.
- `sddComponentType`: An enum (`SddComponentType`) specifying the type of SDD component to generate. Supported types:
  - `AGENT`: Generates a conceptual agent file (e.g., `myNewAgent.agent.ts`) and its corresponding contract file (e.g., `myNewAgent.contract.ts`).
  - `CONTRACT`: Generates a conceptual contract file (e.g., `myNewAgent.contract.ts`).
  - `TEST`: Generates a conceptual contract test file (e.g., `myNewAgent.contract.test.ts`).
  - `FULL_AGENT_SET`: Generates conceptual agent, contract, and contract test files.
- `targetDirectory`: The directory path where the new files should be conceptually generated.
- `requestingAgentId`: The `AgentId` of the agent making the scaffolding request.
- `overwritePolicy`: (Optional) Policy that determines the action when a file already exists. Options typically include `OVERWRITE`, `SKIP`, or `ERROR`.

## Outputs

- A `ContractResult` containing:
  - `result.summaryMessage`: A string summarizing the conceptual files that would be created.
  - `result.generatedFiles`: An array of strings, where each string is the conceptual path to a file that would be generated.
  - `result.generatedFileContents`: An array of objects, where each object contains the `filePath` and `content` of a generated file.
  - `result.skippedFiles`: An optional array of strings, listing files that were not overwritten due to the `OverwritePolicy`.
  - `result.targetDirectory`: The directory where the files were generated.
  - `result.componentName`: The name of the component.
  - `result.sddComponentType`: The type of SDD component generated.
  - `error`: An `AgentError` object if the operation fails (e.g., unsupported `sddComponentType`, missing required inputs).

## Responsibilities

- Receive requests to scaffold new SDD components.
- Validate input parameters.
- Conceptually generate the necessary file paths and names based on the `componentName` and `sddComponentType`.
- Return a summary of the conceptual generation, including the paths of files that would be created.
- Actually create the files on the file system using appropriate templates.
- Populate `generatedFileContents` with the content of the created files.
- Handle `OverwritePolicy` to either overwrite existing files, skip them, or error.
- (Future) Allow for template customization or selection.

## Seams/Contracts

- **Exposes:** `IMVPSddScaffolderAgent` (defined in `c:\\Users\\thump\\SeemsToMe\\src\\contracts\\mvpSddScaffolder.contract.ts`)
  - Method: `generateSddScaffold(request: MVPSddScaffoldRequest): Promise<ContractResult<MVPSddScaffoldOutput, AgentError>>`
- **Consumes:**
  - User/Orchestrator input conforming to `GenerateSddScaffoldRequest`.
  - (Future) File System Agent/Tool: To perform actual file creation operations.
  - (Future) Template Engine/Service: To fetch and populate file templates.
- **Contract Version:** 0.1.0 (as per `c:\\Users\\thump\\SeemsToMe\\src\\contracts\\mvpSddScaffolder.contract.ts`)

## Dependencies

- Currently, none beyond the core types defined in `src/contracts/types.ts`.
- (Future) File System Agent/Tool.
- (Future) Template Management System.

## Example Workflows

**1. Scaffold a new Agent and its Contract:**

- Input:
  ```json
  {
    "componentName": "UserProfile",
    "sddComponentType": "AGENT",
    "targetDirectory": "src/modules/user",
    "requestingAgentId": "OrchestratorAgent",
    "overwritePolicy": "SKIP"
  }
  ```
- Output (Conceptual):
  ```json
  {
    "result": {
      "summaryMessage": "Conceptual scaffolding for UserProfile (AGENT): src/modules/user/UserProfile/userProfile.agent.ts, src/modules/user/UserProfile/userProfile.contract.ts",
      "generatedFiles": [
        "src/modules/user/UserProfile/userProfile.agent.ts",
        "src/modules/user/UserProfile/userProfile.contract.ts"
      ],
      "generatedFileContents": [
        {
          "filePath": "src/modules/user/UserProfile/userProfile.agent.ts",
          "content": "..."
        },
        {
          "filePath": "src/modules/user/UserProfile/userProfile.contract.ts",
          "content": "..."
        }
      ],
      "targetDirectory": "src/modules/user",
      "componentName": "UserProfile",
      "sddComponentType": "AGENT",
      "skippedFiles": []
    }
  }
  ```

**2. Scaffold a Full Agent Set (Agent, Contract, Test):**

- Input:
  ```json
  {
    "componentName": "OrderProcessor",
    "sddComponentType": "FULL_AGENT_SET",
    "targetDirectory": "src/services/orders",
    "requestingAgentId": "DeveloperCLI",
    "overwritePolicy": "OVERWRITE"
  }
  ```
- Output (Conceptual):
  ```json
  {
    "result": {
      "summaryMessage": "Conceptual scaffolding for OrderProcessor (FULL_AGENT_SET): src/services/orders/OrderProcessor/orderProcessor.agent.ts, src/services/orders/OrderProcessor/orderProcessor.contract.ts, src/services/orders/OrderProcessor/orderProcessor.contract.test.ts",
      "generatedFiles": [
        "src/services/orders/OrderProcessor/orderProcessor.agent.ts",
        "src/services/orders/OrderProcessor/orderProcessor.contract.ts",
        "src/services/orders/OrderProcessor/orderProcessor.contract.test.ts"
      ],
      "generatedFileContents": [
        {
          "filePath": "src/services/orders/OrderProcessor/orderProcessor.agent.ts",
          "content": "..."
        },
        {
          "filePath": "src/services/orders/OrderProcessor/orderProcessor.contract.ts",
          "content": "..."
        },
        {
          "filePath": "src/services/orders/OrderProcessor/orderProcessor.contract.test.ts",
          "content": "..."
        }
      ],
      "targetDirectory": "src/services/orders",
      "componentName": "OrderProcessor",
      "sddComponentType": "FULL_AGENT_SET"
    }
  }
  ```

## Key Decisions & Rationale

- **Conceptual Scaffolding First:** The initial implementation focuses on _conceptual_ file generation (i.e., determining what files _would_ be created and where) rather than actual file system operations. This allows for rapid iteration on the contract and agent logic before introducing file system complexities. This has now evolved to actual file creation.
- **`SddComponentType` Enum:** Using an enum for component types provides type safety and clarity for the kinds of scaffolding operations supported.
- **Extensibility for Future File Operations:** The agent is designed with the expectation that actual file creation (using templates) will be added later. The current conceptual output (`generatedFiles` paths) will serve as direct input for that future functionality. This is now implemented.
- **Simple Path Concatenation (Initial):** For now, file paths are constructed via simple string concatenation. A more robust path utility will be integrated later. This has been updated to use `path.join` and create subdirectories for components.
- **`generatedFileContents`:** Added to provide the actual content of the scaffolded files, enabling immediate use or verification by the calling agent.
- **`OverwritePolicy`:** Provides control over behavior when target files already exist.

## Testing & Validation

- **Contract Tests (`mvpSddScaffolder.contract.test.ts`):**
  - Verify that the agent correctly implements the `IMVPSddScaffolderAgent` contract.
  - Test successful conceptual generation for each `SddComponentType` (`AGENT`, `CONTRACT`, `TEST`, `FULL_AGENT_SET`), checking the `summaryMessage`, `generatedFiles`, and `generatedFileContents` output.
  - Test `OverwritePolicy` behaviors (`SKIP`, `OVERWRITE`, `ERROR`).
  - Test error handling for invalid or missing inputs (e.g., missing `componentName`, unsupported `sddComponentType`).
  - Verify that `NotImplementedError` was correctly returned by the initial stub.
- **Working Correctly:**
  - The agent correctly identifies the files to be conceptually generated based on the input.
  - The conceptual file paths are accurate for the given `targetDirectory` and `componentName`.
  - Error conditions are handled gracefully, returning an appropriate `AgentError`.
  - Actual files are created with correct content based on templates.
  - `generatedFileContents` is populated correctly.
  - `OverwritePolicy` is respected.

---
