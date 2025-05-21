// filepath: c:\Users\thump\SeemsToMe\src\index.ts
/**
 * PURPOSE: Entry point for the SeemsToMe multi-agent system
 * DATA FLOW: Bootstraps the system and connects agents
 * INTEGRATION POINTS: All agents through the Orchestrator
 * CONTRACT VERSION: v1
 * ERROR HANDLING: Top-level error handling and logging
 */

import { OrchestratorAgent } from './agents/orchestrator.agent';
import { KnowledgeAgent } from './agents/knowledge.agent';
import { TaskPriority } from './contracts/types';

/**
 * Bootstrap the SeemsToMe agent ecosystem
 */
async function bootstrap() {
  try {
    console.log('Starting SeemsToMe SDD multi-agent system...');
    
    // Initialize agents
    const orchestrator = new OrchestratorAgent();
    const knowledgeAgent = new KnowledgeAgent();
    
    // Register agents with orchestrator
    await orchestrator.registerAgent('knowledge-agent', ['retrieve', 'store']);
    console.log('Knowledge Agent registered with Orchestrator');
    
    // Example task submission
    const taskResult = await orchestrator.submitTask({
      taskId: 'demo-task',
      agentId: 'knowledge-agent',
      action: 'retrieveKnowledge',
      parameters: {
        query: 'What is SDD?',
        maxResults: 3
      },
      priority: TaskPriority.NORMAL
    });
    
    console.log('Task submitted:', taskResult);
    
    console.log('SeemsToMe system initialized successfully.');
    return { orchestrator, knowledgeAgent };
  } catch (error) {
    console.error('Failed to bootstrap SeemsToMe system:', error);
    throw error;
  }
}

// If this file is run directly, bootstrap the system
if (require.main === module) {
  bootstrap()
    .then(() => console.log('System running...'))
    .catch(error => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

// Export for use in other modules
export { bootstrap };
