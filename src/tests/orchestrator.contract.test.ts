// filepath: c:\Users\thump\SeemsToMe\src\tests\orchestrator.contract.test.ts
/**
 * PURPOSE: Test contract conformance for the Orchestrator Agent
 * DATA FLOW: Test ↔ Orchestrator Agent
 * INTEGRATION POINTS: Orchestrator Contract
 * CONTRACT VERSION: v1
 * ERROR HANDLING: Tests various error cases defined in the contract
 */

import { OrchestratorAgent } from '../agents/orchestrator.agent';
import { OrchestratorContract, TaskRequest } from '../contracts/orchestrator.contract';
import { AgentId, TaskPriority, TaskStatus, ErrorCategory } from '../contracts/types';

describe('Orchestrator Contract Conformance', () => {
  let orchestrator: OrchestratorContract;
  const testAgentId: AgentId = 'test-agent';
  
  beforeEach(() => {
    // Create a fresh instance for each test
    orchestrator = new OrchestratorAgent();
  });
  
  describe('registerAgent', () => {
    test('should register a new agent successfully', async () => {
      const capabilities = ['test', 'mock'];
      const result = await orchestrator.registerAgent(testAgentId, capabilities);
      expect(result).toBe(true);
    });
    
    test('should return false when registering an existing agent', async () => {
      const capabilities = ['test'];
      await orchestrator.registerAgent(testAgentId, capabilities);
      const result = await orchestrator.registerAgent(testAgentId, capabilities);
      expect(result).toBe(false);
    });
  });
  
  describe('deregisterAgent', () => {
    test('should deregister an existing agent', async () => {
      await orchestrator.registerAgent(testAgentId, ['test']);
      const result = await orchestrator.deregisterAgent(testAgentId);
      expect(result).toBe(true);
    });
    
    test('should return false when deregistering a non-existent agent', async () => {
      const result = await orchestrator.deregisterAgent('non-existent-agent');
      expect(result).toBe(false);
    });
  });
  
  describe('submitTask', () => {
    test('should accept a task for a registered agent', async () => {
      await orchestrator.registerAgent(testAgentId, ['test']);
      
      const taskRequest: TaskRequest = {
        taskId: 'test-task',
        agentId: testAgentId,
        action: 'test',
        parameters: { test: 'value' },
        priority: TaskPriority.NORMAL
      };
      
      const result = await orchestrator.submitTask(taskRequest);
      expect(result.taskId).toBe(taskRequest.taskId);
      expect(result.status).toBe(TaskStatus.PENDING);
    });
    
    test('should reject a task for an unregistered agent', async () => {
      const taskRequest: TaskRequest = {
        taskId: 'test-task',
        agentId: 'unregistered-agent',
        action: 'test',
        parameters: {},
        priority: TaskPriority.NORMAL
      };
      
      const result = await orchestrator.submitTask(taskRequest);
      expect(result.status).toBe(TaskStatus.FAILED);
      expect(result.errors).toBeDefined();
      expect(result.errors![0].category).toBe(ErrorCategory.AGENT_UNAVAILABLE);
    });
  });
  
  describe('getTaskStatus', () => {
    test('should get status for an existing task', async () => {
      await orchestrator.registerAgent(testAgentId, ['test']);
      
      const taskRequest: TaskRequest = {
        taskId: 'test-task',
        agentId: testAgentId,
        action: 'test',
        parameters: {},
        priority: TaskPriority.NORMAL
      };
      
      await orchestrator.submitTask(taskRequest);
      const status = await orchestrator.getTaskStatus(taskRequest.taskId);
      expect(status).toBe(TaskStatus.PENDING);
    });
    
    test('should throw error for non-existent task', async () => {
      await expect(orchestrator.getTaskStatus('non-existent-task'))
        .rejects.toThrow('Task non-existent-task not found');
    });
  });
});
