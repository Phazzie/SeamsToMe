// filepath: c:\Users\thump\SeemsToMe\src\tests\system.test.ts
/**
 * PURPOSE: Test the system integration of multiple agents
 * DATA FLOW: Test → Orchestrator → Knowledge
 * INTEGRATION POINTS: Orchestrator, Knowledge
 * CONTRACT VERSION: v1
 * ERROR HANDLING: Tests error scenarios between agents
 */

import { bootstrap } from '../index';
import { TaskPriority } from '../contracts/types';

describe('SeemsToMe System Integration', () => {
  test('should bootstrap the system successfully', async () => {
    const system = await bootstrap();
    expect(system.orchestrator).toBeDefined();
    expect(system.knowledgeAgent).toBeDefined();
  });
  
  test('should allow task submission through orchestrator', async () => {
    const system = await bootstrap();
    
    const taskResult = await system.orchestrator.submitTask({
      taskId: 'test-system-task',
      agentId: 'knowledge-agent',
      action: 'retrieveKnowledge',
      parameters: {
        query: 'SDD'
      },
      priority: TaskPriority.NORMAL
    });
      expect(taskResult.success).toBe(true);
    if (taskResult.success) {
      expect(taskResult.result.taskId).toBe('test-system-task');
      expect(taskResult.result.status).toBeDefined();
    }
  });
  
  test('should retrieve task status', async () => {
    const system = await bootstrap();
    const taskId = 'status-test-task';
    
    await system.orchestrator.submitTask({
      taskId,
      agentId: 'knowledge-agent',
      action: 'retrieveKnowledge',
      parameters: {
        query: 'test'
      },
      priority: TaskPriority.NORMAL
    });
    
    const status = await system.orchestrator.getTaskStatus(taskId);
    expect(status).toBeDefined();
  });
});
