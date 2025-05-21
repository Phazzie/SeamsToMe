// filepath: c:\Users\thump\SeemsToMe\src\examples\checklist-changelog-docs-integration.ts
/**
 * PURPOSE: Demonstrate integration of Checklist, Changelog, and Documentation agents
 * DATA FLOW: Example → Orchestrator → Agents
 * INTEGRATION POINTS: Orchestrator, Checklist, Changelog, Documentation
 * CONTRACT VERSION: v1
 * ERROR HANDLING: Basic error handling with console output
 */

import { OrchestratorAgent } from '../agents/orchestrator.agent';
import { ChecklistAgent } from '../agents/checklist.agent';
import { ChangelogAgent } from '../agents/changelog.agent';
import { DocumentationAgent } from '../agents/documentation.agent';
import { TaskPriority } from '../contracts/types';
import { ChangeType, ChangeImpact } from '../contracts/changelog.contract';
import { ChecklistCategory } from '../contracts/checklist.contract';
import { DocumentationType, DocumentationFormat } from '../contracts/documentation.contract';
import * as path from 'path';

/**
 * SDD Example: Using checklist, changelog, and documentation together
 * for a complete development workflow
 */
async function runCompleteWorkflowExample() {
  try {
    console.log('Starting SDD Complete Workflow Example with Documentation...');
    
    // Create agent instances
    const checklistAgent = new ChecklistAgent();
    const changelogAgent = new ChangelogAgent();
    const documentationAgent = new DocumentationAgent();
    
    // Create orchestrator with injected agents
    const orchestrator = new OrchestratorAgent({
      checklistAgent,
      changelogAgent,
      documentationAgent
    });
    
    // Register agents with orchestrator
    await orchestrator.registerAgent('checklist-agent', ['checkCompliance', 'generateReport']);
    await orchestrator.registerAgent('changelog-agent', ['recordChange', 'generateChangelog']);
    await orchestrator.registerAgent('documentation-agent', ['generateDocumentation', 'validateDocumentation']);
    
    console.log('Agents registered with orchestrator');
    
    // WORKFLOW STEP 1: Create a new contract
    console.log('\nWORKFLOW STEP 1: Creating a new contract...');
    console.log('A new feature requires adding a NotificationContract');
    console.log('Extracting blueprint comments from existing contracts...');
    
    // Extract blueprint comments for reference
    const extractCommentsResult = await orchestrator.submitTask({
      taskId: 'extract-comments-1',
      agentId: 'documentation-agent',
      action: 'extractBlueprintComments',
      parameters: {
        sourcePaths: [
          './src/contracts/orchestrator.contract.ts',
          './src/contracts/checklist.contract.ts'
        ]
      },
      priority: TaskPriority.NORMAL
    });
    
    console.log('Blueprint comments extracted from existing contracts');
    
    // WORKFLOW STEP 2: Add the contract and check SDD compliance
    console.log('\nWORKFLOW STEP 2: Verifying SDD compliance of new contract...');
    
    const complianceResult = await orchestrator.submitTask({
      taskId: 'compliance-check-1',
      agentId: 'checklist-agent',
      action: 'checkCompliance',
      parameters: {
        targetPath: './src/contracts/notification.contract.ts',
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
    
    // WORKFLOW STEP 3: Generate documentation for the contract
    console.log('\nWORKFLOW STEP 3: Generating contract documentation...');
    
    const docResult = await orchestrator.submitTask({
      taskId: 'generate-doc-1',
      agentId: 'documentation-agent',
      action: 'generateDocumentation',
      parameters: {
        docRequest: {
          docType: DocumentationType.CONTRACT,
          sources: [
            {
              path: './src/contracts/notification.contract.ts',
              type: 'FILE'
            }
          ],
          format: DocumentationFormat.MARKDOWN,
          requestingAgentId: 'orchestrator'
        }
      },
      priority: TaskPriority.NORMAL
    });
    
    console.log('Documentation generated in', 
      docResult.result ? `${docResult.result.metadata.generationTime}ms` : 'pending');
    
    if (docResult.result) {
      console.log('\nExcerpt from generated documentation:');
      console.log(docResult.result.content.substring(0, 200) + '...');
    }
    
    // WORKFLOW STEP 4: Record the contract addition in the changelog
    console.log('\nWORKFLOW STEP 4: Recording contract addition in changelog...');
    
    const changeResult = await orchestrator.submitTask({
      taskId: 'record-change-1',
      agentId: 'changelog-agent',
      action: 'recordChange',
      parameters: {
        change: {
          type: ChangeType.FEATURE,
          description: 'Added new NotificationContract for system alerts',
          files: ['./src/contracts/notification.contract.ts'],
          impact: ChangeImpact.MINOR,
          agentId: 'developer-1',
          breaking: false,
          relatedContracts: ['NotificationContract']
        }
      },
      priority: TaskPriority.NORMAL
    });
    
    console.log('Change recorded with ID:', changeResult.result ? changeResult.result.changeId : 'Pending');
    
    // WORKFLOW STEP 5: Create a seam definition based on the contract
    console.log('\nWORKFLOW STEP 5: Generating seam documentation...');
    
    const seamDocResult = await documentationAgent.generateDocumentation({
      docType: DocumentationType.SEAM,
      sources: [
        {
          path: './src/contracts/notification.contract.ts',
          type: 'FILE'
        }
      ],
      format: DocumentationFormat.MARKDOWN,
      requestingAgentId: 'orchestrator'
    });
    
    console.log('\nExcerpt from generated seam documentation:');
    console.log(seamDocResult.content.substring(0, 200) + '...');
    
    // WORKFLOW STEP 6: Update the agent catalog with the new notification agent
    console.log('\nWORKFLOW STEP 6: Generating agent documentation...');
    
    const agentDocResult = await documentationAgent.generateDocumentation({
      docType: DocumentationType.AGENT,
      sources: [
        {
          content: `
          /**
           * PURPOSE: Provide notification services to the system
           * DATA FLOW: Notification Agent ↔ Other agents
           * INTEGRATION POINTS: Orchestrator
           * CONTRACT VERSION: v1
           * ERROR HANDLING: Detailed error reporting for notification failures
           */
          `,
          type: 'STRING',
          path: 'notification-agent-blueprint'
        }
      ],
      format: DocumentationFormat.MARKDOWN,
      requestingAgentId: 'orchestrator'
    });
    
    console.log('\nExcerpt from generated agent documentation:');
    console.log(agentDocResult.content.substring(0, 200) + '...');
    
    // WORKFLOW STEP 7: Generate a changelog for the release
    console.log('\nWORKFLOW STEP 7: Generating changelog for release...');
    
    const changelog = await changelogAgent.generateChangelog({}, 'markdown');
    console.log('Changelog generated:', changelog.substring(0, 150) + '...');
    
    console.log('\nComplete workflow example finished successfully!');
    
  } catch (error) {
    console.error('Error running example:', error);
  }
}

// Run the example
export async function runCompleteWorkflowExample() {
  // Import and run the example here, using dynamic import to avoid circular dependencies
  const example = await import('./checklist-changelog-docs-integration');
  return example.runCompleteWorkflowExample();
}

// If this file is run directly, execute the example
if (require.main === module) {
  runCompleteWorkflowExample()
    .then(() => console.log('Example finished'))
    .catch(error => console.error('Example failed:', error));
}
