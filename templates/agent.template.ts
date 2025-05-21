import { AgentId, ContractResult, AgentError, success, failure } from "../contracts/types";
import { I{{ComponentNamePascalCase}}Agent, {{ComponentNamePascalCase}}Request, {{ComponentNamePascalCase}}Response } from "../contracts/{{componentName}}.contract";

export class {{ComponentNamePascalCase}}Agent implements I{{ComponentNamePascalCase}}Agent {
    agentId: AgentId = "{{ComponentNamePascalCase}}Agent";

    async handle{{ComponentNamePascalCase}}Request(request: {{ComponentNamePascalCase}}Request): Promise<ContractResult<{{ComponentNamePascalCase}}Response>> {
        try {
            // TODO: Replace this example logic with your actual agent implementation.
            // This typically involves:
            // 1. Validating the request.
            // 2. Performing business logic (e.g., interacting with other agents, services, or data sources).
            // 3. Constructing the {{ComponentNamePascalCase}}Response.
            console.log(`{{ComponentNamePascalCase}}Agent received request for {{componentName}}:`, request);

            // Example response - customize this
            const response: {{ComponentNamePascalCase}}Response = {
                message: `Hello from {{ComponentNamePascalCase}}Agent, you sent: ${request.inputData}`
            };
            return success(response);
        } catch (error) {
            console.error("Error in {{ComponentNamePascalCase}}Agent:", error);
            // Ensure the AgentError constructor receives the correct agentId and a descriptive message
            const descriptiveError = error instanceof Error ? error.message : String(error);
            return failure(new AgentError(this.agentId, `Failed to handle {{componentName}} request: ${descriptiveError}`));
        }
    }
}
