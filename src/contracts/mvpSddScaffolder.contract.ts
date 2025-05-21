// CONTRACT_VERSION: 0.1.0
// Blueprint Comments:
// Purpose: To scaffold new SDD components (like agents, contracts, tests) based on predefined templates and user input.
// Data Flow: Receives a request detailing the component to be scaffolded (name, type, target location) and outputs information about the generated files (paths, status).
// Integration Points (Future): May integrate with an OrchestratorAgent for automated scaffolding tasks, a ProjectSetupAgent, or potentially a UI for user-driven scaffolding. It will depend on agents like a FileSystemAgent (conceptual) for file operations.

import {
  AgentError,
  AgentId as AgentIdFromTypes,
  ContractResult,
} from "./types"; // Renamed imported AgentId to avoid conflict

// Export AgentId directly from here if it's meant to be specific to this contract's context,
// or ensure it's correctly exported from './types' and re-exported if needed.
// For now, let's assume AgentId from './types' is the one to be used and re-export it.
export type AgentId = AgentIdFromTypes;

/**
 * @SddComponentType
 * Defines the types of SDD components that can be scaffolded.
 * - 'agent': Scaffolds an agent file.
 * - 'contract': Scaffolds a contract file.
 * - 'test': Scaffolds a contract test file.
 * - 'full-agent-set': Scaffolds an agent, its contract, and its contract test file.
 */
export enum SddComponentType {
  AGENT = "agent",
  CONTRACT = "contract",
  TEST = "test",
  FULL_AGENT_SET = "full-agent-set",
}

/**
 * @OverwritePolicy
 * Defines how the scaffolding agent should handle existing files.
 * - 'error': If a file to be generated already exists, abort the operation and return an error.
 * - 'overwrite': Silently overwrite existing files.
 * - 'skip': If a file to be generated already exists, skip creating it.
 */
export enum OverwritePolicy {
  ERROR_IF_EXISTS = "errorIfExists",
  OVERWRITE = "overwrite",
  SKIP = "skip",
}

/**
 * @MVPSddScaffoldRequest
 * Defines the input for the MVPSddScaffolderAgent's generateSddScaffold method.
 */
export interface MVPSddScaffoldRequest {
  requestingAgentId: AgentId;
  componentName: string; // e.g., "MyNewFeature"
  sddComponentType: SddComponentType;
  targetDirectory: string; // e.g., "./src/newAgents"
  templateVariables?: Record<string, string>; // Optional, for passing values to templates
  overwritePolicy?: OverwritePolicy; // Optional, defaults to 'errorIfExists' in agent logic
}

/**
 * @GeneratedFileDetail
 * Interface representing the details of a generated file.
 */
export interface GeneratedFileDetail {
  filePath: string;
  content: string;
}

/**
 * @MVPSddScaffoldOutput
 * Defines the output for the MVPSddScaffolderAgent's generateSddScaffold method.
 */
export interface MVPSddScaffoldOutput {
  scaffolderAgentId: AgentId;
  generatedFiles: string[]; // Paths of files that would be/were conceptually generated
  overallStatus: "success" | "partial_success" | "failure";
  summaryMessage?: string;
  generatedFileContents?: GeneratedFileDetail[]; // Content of conceptually generated files
}

/**
 * @IMVPSddScaffolderAgent
 * Contract for an agent responsible for scaffolding SDD components.
 * This agent helps in creating the basic structure for new agents,
 * their contracts, and tests according to SDD principles.
 */
export interface IMVPSddScaffolderAgent {
  /**
   * Generates the specified SDD component(s) based on the request.
   * @param request - The details of the component(s) to scaffold.
   * @returns A ContractResult containing the status of the scaffolding operation and details of generated files, or an AgentError if the operation fails.
   */
  generateSddScaffold(
    request: MVPSddScaffoldRequest
  ): Promise<ContractResult<MVPSddScaffoldOutput, AgentError>>;
}

/**
 * @MVPSddScaffolderAgentContract
 * Type alias for the MVPSddScaffolderAgent contract.
 * Provides a clear and consistent way to refer to the agent's interface.
 */
export type MVPSddScaffolderAgentContract = IMVPSddScaffolderAgent;
