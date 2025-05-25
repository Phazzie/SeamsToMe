// filepath: c:\Users\thump\SeemsToMe\src\index.ts
/**
 * PURPOSE: Entry point for the SeemsToMe multi-agent system
 * DATA FLOW: Bootstraps the system and connects agents
 * INTEGRATION POINTS: All agents through the Orchestrator
 * CONTRACT VERSION: v1
 * ERROR HANDLING: Top-level error handling and logging
 */

import { KnowledgeAgent } from "./agents/knowledge.agent";
import { OrchestratorAgent } from "./agents/orchestrator.agent";
import { TaskPriority } from "./contracts/types";

/**
 * Bootstrap the SeemsToMe agent ecosystem
 */
async function bootstrap() {
  try {
    console.log("Starting SeemsToMe SDD multi-agent system...");    // Initialize agents
    const knowledgeAgent = new KnowledgeAgent();
    const orchestrator = new OrchestratorAgent({
      knowledgeAgent: knowledgeAgent
    });
    // Register agents with orchestrator
    const registrationResult = await orchestrator.registerAgent(
      "knowledge-agent",
      ["retrieve", "store"]
    );
    if (registrationResult.success) {
      console.log("Knowledge Agent registered with Orchestrator");
    } else {
      console.error(
        "Failed to register Knowledge Agent:",
        registrationResult.error
      );
    }

    // Example task submission
    const taskResult = await orchestrator.submitTask({
      taskId: "demo-task",
      agentId: "knowledge-agent",
      action: "retrieveKnowledge",
      parameters: {
        query: "What is SDD?",
        maxResults: 3,
      },
      priority: TaskPriority.NORMAL,
    });

    if (taskResult.success) {
      console.log("Task submitted successfully:", taskResult.result);
    } else {
      console.log("Task submission failed:", taskResult.error);
    }

    console.log("SeemsToMe system initialized successfully.");
    return { orchestrator, knowledgeAgent };
  } catch (error) {
    console.error("Failed to bootstrap SeemsToMe system:", error);
    throw error;
  }
}

// If this file is run directly, bootstrap the system
if (require.main === module) {
  bootstrap()
    .then(() => console.log("System running..."))
    .catch((error) => {
      console.error("Fatal error:", error);
      process.exit(1);
    });
}

// Export for use in other modules
export { bootstrap };
