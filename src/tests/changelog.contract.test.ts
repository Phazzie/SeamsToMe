// filepath: c:\Users\thump\SeemsToMe\src\tests\changelog.contract.test.ts
/**
 * PURPOSE: Test contract conformance for the Changelog Agent
 * DATA FLOW: Test ↔ Changelog Agent
 * INTEGRATION POINTS: Changelog Contract
 * CONTRACT VERSION: v1
 * ERROR HANDLING: Tests various error cases defined in the contract
 */

import { ChangelogAgent } from '../agents/changelog.agent';
import { 
  ChangelogContract,
  RecordChangeRequest,
  ChangelogRequest,
  ChangeType,
  ChangeImpact
} from '../contracts/changelog.contract';

describe('Changelog Contract Conformance', () => {
  let changelog: ChangelogContract;
  
  beforeEach(() => {
    // Create a fresh instance for each test
    changelog = new ChangelogAgent();
  });
  
  describe('recordChange', () => {
    test('should record a change and return an ID', async () => {
      const request: RecordChangeRequest = {
        type: ChangeType.FEATURE,
        description: 'Test feature',
        files: ['test.ts'],
        impact: ChangeImpact.MINOR,
        agentId: 'test-agent',
        breaking: false
      };
      
      const changeId = await changelog.recordChange(request);
      expect(typeof changeId).toBe('string');
      expect(changeId).toBeTruthy();
    });
    
    test('should record a breaking change with migration guidance', async () => {
      const request: RecordChangeRequest = {
        type: ChangeType.CONTRACT_CHANGE,
        description: 'Breaking contract change',
        files: ['contract.ts'],
        impact: ChangeImpact.BREAKING,
        agentId: 'test-agent',
        breaking: true,
        relatedContracts: ['TestContract'],
        migrationGuidance: 'Update to the new interface'
      };
      
      const changeId = await changelog.recordChange(request);
      expect(typeof changeId).toBe('string');
      expect(changeId).toBeTruthy();
        // Verify the change was recorded properly by checking breaking changes
      const breakingChanges = await changelog.getBreakingChanges();
      expect(breakingChanges.success).toBe(true);
      if (breakingChanges.success) {
        expect(breakingChanges.result.length).toBeGreaterThan(0);
        expect(breakingChanges.result[0].migrationGuidance).toBe(request.migrationGuidance);
      }
    });
  });
  
  describe('getChanges', () => {
    beforeEach(async () => {
      // Add some test data
      await changelog.recordChange({
        type: ChangeType.FEATURE,
        description: 'Test feature',
        files: ['feature.ts'],
        impact: ChangeImpact.MINOR,
        agentId: 'test-agent',
        breaking: false
      });
      
      await changelog.recordChange({
        type: ChangeType.BUGFIX,
        description: 'Test bugfix',
        files: ['bugfix.ts'],
        impact: ChangeImpact.NONE,
        agentId: 'test-agent',
        breaking: false
      });
      
      await changelog.recordChange({
        type: ChangeType.CONTRACT_CHANGE,
        description: 'Breaking change',
        files: ['contract.ts'],
        impact: ChangeImpact.BREAKING,
        agentId: 'contract-agent',
        breaking: true,
        relatedContracts: ['TestContract']
      });
    });
      test('should get all changes when no filters are provided', async () => {
      const response = await changelog.getChanges({});
      expect(response.success).toBe(true);
      if (response.success) {
        expect(response.result.totalChanges).toBe(3);
        expect(response.result.breakingChanges).toBe(1);
      }
    });
      test('should filter by change type', async () => {
      const response = await changelog.getChanges({
        types: [ChangeType.FEATURE]
      });
      
      expect(response.success).toBe(true);
      if (response.success) {
        expect(response.result.totalChanges).toBe(1);
        expect(response.result.changes[0].type).toBe(ChangeType.FEATURE);
      }
    });
      test('should filter by agent ID', async () => {
      const response = await changelog.getChanges({
        agentId: 'contract-agent'
      });
      
      expect(response.success).toBe(true);
      if (response.success) {
        expect(response.result.totalChanges).toBe(1);
        expect(response.result.changes[0].agentId).toBe('contract-agent');
      }
    });
      test('should filter by impact level', async () => {
      const response = await changelog.getChanges({
        impactLevel: ChangeImpact.BREAKING
      });
      
      expect(response.success).toBe(true);
      if (response.success) {
        expect(response.result.totalChanges).toBe(1);
        expect(response.result.changes[0].impact).toBe(ChangeImpact.BREAKING);
      }
    });
      test('should filter by contract', async () => {
      const response = await changelog.getChanges({
        contract: 'TestContract'
      });
      
      expect(response.success).toBe(true);
      if (response.success) {
        expect(response.result.totalChanges).toBe(1);
        expect(response.result.changes[0].relatedContracts).toContain('TestContract');
      }
    });
      test('should filter breaking changes only', async () => {
      const response = await changelog.getChanges({
        includeBreakingOnly: true
      });
      
      expect(response.success).toBe(true);
      if (response.success) {
        expect(response.result.totalChanges).toBe(1);
        expect(response.result.changes[0].breaking).toBe(true);
      }
    });
  });
  
  describe('generateChangelog', () => {
    beforeEach(async () => {
      // Add some test data
      await changelog.recordChange({
        type: ChangeType.FEATURE,
        description: 'Test feature',
        files: ['feature.ts'],
        impact: ChangeImpact.MINOR,
        agentId: 'test-agent',
        breaking: false
      });
      
      await changelog.recordChange({
        type: ChangeType.CONTRACT_CHANGE,
        description: 'Breaking change',
        files: ['contract.ts'],
        impact: ChangeImpact.BREAKING,
        agentId: 'contract-agent',
        breaking: true,
        relatedContracts: ['TestContract'],
        migrationGuidance: 'Update to v2 interface'
      });
    });
    
    test('should generate a markdown changelog', async () => {
      const markdown = await changelog.generateChangelog({}, 'markdown');
      
      expect(typeof markdown).toBe('string');
      expect(markdown).toContain('# Changelog');
      expect(markdown).toContain('FEATURE');
      expect(markdown).toContain('Test feature');
      expect(markdown).toContain('CONTRACT_CHANGE');
      expect(markdown).toContain('Breaking change');
      expect(markdown).toContain('[BREAKING]');
    });
    
    test('should throw error for unsupported formats', async () => {
      await expect(changelog.generateChangelog({}, 'unsupported'))
        .rejects.toThrow('Format unsupported not supported yet');
    });
  });
  
  describe('getBreakingChanges', () => {
    beforeEach(async () => {
      await changelog.recordChange({
        type: ChangeType.FEATURE,
        description: 'Test feature',
        files: ['feature.ts'],
        impact: ChangeImpact.MINOR,
        agentId: 'test-agent',
        breaking: false
      });
      
      await changelog.recordChange({
        type: ChangeType.CONTRACT_CHANGE,
        description: 'Breaking change',
        files: ['contract.ts'],
        impact: ChangeImpact.BREAKING,
        agentId: 'contract-agent',
        breaking: true,
        migrationGuidance: 'Update to v2'
      });
    });
      test('should return only breaking changes', async () => {
      const breakingChanges = await changelog.getBreakingChanges();
      
      expect(breakingChanges.success).toBe(true);
      if (breakingChanges.success) {
        expect(breakingChanges.result.length).toBe(1);
        expect(breakingChanges.result[0].breaking).toBe(true);
        expect(breakingChanges.result[0].description).toContain('Breaking change');
      }
    });
  });
});
