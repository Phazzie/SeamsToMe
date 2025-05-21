// filepath: c:\Users\thump\SeemsToMe\src\examples\checklist-changelog-integration.ts
/**
 * PURPOSE: Demonstrate integration of Checklist and Changelog agents
 * DATA FLOW: Example → Orchestrator → Agents
 * INTEGRATION POINTS: Orchestrator, Checklist, Changelog
 * CONTRACT VERSION: v1
 * ERROR HANDLING: Basic error handling with console output
 */

import { OrchestratorAgent } from '../agents/orchestrator.agent';
import { ChecklistAgent } from '../agents/checklist.agent';
import { ChangelogAgent } from '../agents/changelog.agent';
import { TaskPriority } from '../contracts/types';
import { ChangeType, ChangeImpact } from '../contracts/changelog.contract';
import { ChecklistCategory } from '../contracts/checklist.contract';

/**
 * SDD Example: Using checklist and changelog together for a development workflow
 */
async function runChecklistChangelogExample() {
  try {
    console.log('Starting SDD Checklist and Changelog Integration Example...');
    
    // Create agent instances
    const checklistAgent = new ChecklistAgent();
    const changelogAgent = new ChangelogAgent();
    
    // Create orchestrator with injected agents
    const orchestrator = new OrchestratorAgent({
      checklistAgent,
      changelogAgent
    });
    
    // Register agents with orchestrator
    await orchestrator.registerAgent('checklist-agent', ['checkCompliance', 'generateReport']);
    await orchestrator.registerAgent('changelog-agent', ['recordChange', 'generateChangelog']);
    
    console.log('Agents registered with orchestrator');
    
    // Step 1: Check compliance of a new file
    console.log('\nStep 1: Running compliance check on new contract file...');
    
    const complianceResult = await orchestrator.submitTask({
      taskId: 'compliance-check-1',
      agentId: 'checklist-agent',
      action: 'checkCompliance',
      parameters: {
        targetPath: './src/contracts/new-feature.contract.ts',
        categories: [
          ChecklistCategory.CONTRACT_DEFINITION,
          ChecklistCategory.DOCUMENTATION
        ]
      },
      priority: TaskPriority.NORMAL
    });
    
    console.log('Compliance check result:', 
      complianceResult.result ? 
      `${complianceResult.result.summary.compliant} compliant, ${complianceResult.result.summary.notCompliant} non-compliant` : 
      'Pending');
    
    // Step 2: Record a contract change
    console.log('\nStep 2: Recording a contract change...');
    
    const changeResult = await orchestrator.submitTask({
      taskId: 'record-change-1',
      agentId: 'changelog-agent',
      action: 'recordChange',
      parameters: {
        change: {
          type: ChangeType.CONTRACT_CHANGE,
          description: 'Added new parameter to UserProfile contract',
          files: ['./src/contracts/user-profile.contract.ts'],
          impact: ChangeImpact.MINOR,
          agentId: 'developer-1',
          breaking: false,
          relatedContracts: ['UserProfileContract']
        }
      },
      priority: TaskPriority.NORMAL
    });
    
    console.log('Change recorded with ID:', changeResult.result ? changeResult.result.changeId : 'Pending');
    
    // Step 3: Generate a compliance report
    console.log('\nStep 3: Generating compliance report...');
    
    const report = await checklistAgent.generateReport('./src/contracts', 'markdown');
    console.log('Compliance report generated:', report.substring(0, 150) + '...');
    
    // Step 4: Get breaking changes
    console.log('\nStep 4: Checking for breaking changes...');
    
    // Record a breaking change first
    await changelogAgent.recordChange({
      type: ChangeType.CONTRACT_CHANGE,
      description: 'Removed deprecated methods from AuthContract',
      files: ['./src/contracts/auth.contract.ts'],
      impact: ChangeImpact.BREAKING,
      agentId: 'developer-2',
      breaking: true,
      relatedContracts: ['AuthContract'],
      migrationGuidance: 'Use the new authentication methods instead'
    });
    
    const breakingChanges = await changelogAgent.getBreakingChanges();
    console.log(`Found ${breakingChanges.length} breaking changes`);
    
    if (breakingChanges.length > 0) {
      console.log('Breaking change:', breakingChanges[0].description);
      console.log('Migration guidance:', breakingChanges[0].migrationGuidance);
    }
    
    // Step 5: Generate a changelog
    console.log('\nStep 5: Generating changelog...');
    
    const changelog = await changelogAgent.generateChangelog({}, 'markdown');
    console.log('Changelog generated:', changelog.substring(0, 150) + '...');
    
    console.log('\nExample completed successfully!');
    
  } catch (error) {
    console.error('Error running example:', error);
  }
}

// Run the example
runChecklistChangelogExample()
  .then(() => console.log('Example finished'))
  .catch(error => console.error('Example failed:', error));
