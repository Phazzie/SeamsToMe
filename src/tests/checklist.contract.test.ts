// filepath: c:\Users\thump\SeemsToMe\src\tests\checklist.contract.test.ts
/**
 * PURPOSE: Test contract conformance for the Checklist Agent
 * DATA FLOW: Test ↔ Checklist Agent
 * INTEGRATION POINTS: Checklist Contract
 * CONTRACT VERSION: v1
 * ERROR HANDLING: Tests various error cases defined in the contract
 */

import { ChecklistAgent } from '../agents/checklist.agent';
import { 
  ChecklistContract, 
  ChecklistRequest,
  ChecklistCategory,
  ComplianceStatus
} from '../contracts/checklist.contract';

describe('Checklist Contract Conformance', () => {
  let checklist: ChecklistContract;
  
  beforeEach(() => {
    // Create a fresh instance for each test
    checklist = new ChecklistAgent();
  });
  
  describe('getCategories', () => {
    test('should return all available categories', async () => {
      const categories = await checklist.getCategories();
      expect(categories).toBeInstanceOf(Array);
      expect(categories.length).toBeGreaterThan(0);
      expect(categories).toContain(ChecklistCategory.CONTRACT_DEFINITION);
      expect(categories).toContain(ChecklistCategory.DOCUMENTATION);
    });
  });
  
  describe('checkCompliance', () => {
    test('should check compliance for a target path', async () => {
      const request: ChecklistRequest = {
        targetPath: '/test/path',
        requestingAgentId: 'test-agent'
      };
      
      const response = await checklist.checkCompliance(request);
      expect(response.targetPath).toBe(request.targetPath);
      expect(response.items).toBeInstanceOf(Array);
      expect(response.summary).toBeDefined();
      expect(response.summary.overallStatus).toBeDefined();
    });
    
    test('should filter by categories when specified', async () => {
      const categories = [ChecklistCategory.CONTRACT_DEFINITION, ChecklistCategory.TESTING];
      
      const request: ChecklistRequest = {
        targetPath: '/test/path',
        categories,
        requestingAgentId: 'test-agent'
      };
      
      const response = await checklist.checkCompliance(request);
      
      // All items should belong to the requested categories
      response.items.forEach(item => {
        expect(categories).toContain(item.category);
      });
      
      // Should have at least one item per category
      const foundCategories = new Set(response.items.map(item => item.category));
      categories.forEach(category => {
        expect(foundCategories.has(category)).toBe(true);
      });
    });
  });
  
  describe('generateReport', () => {
    test('should generate a report in markdown format', async () => {
      const targetPath = '/test/path';
      const format = 'markdown';
      
      const report = await checklist.generateReport(targetPath, format);
      expect(typeof report).toBe('string');
      expect(report).toContain('SDD Compliance Report');
      expect(report).toContain(targetPath);
    });
    
    test('should throw error for unsupported formats', async () => {
      const targetPath = '/test/path';
      const format = 'unsupported';
      
      await expect(checklist.generateReport(targetPath, format))
        .rejects.toThrow(`Format ${format} not supported yet`);
    });
  });
});
