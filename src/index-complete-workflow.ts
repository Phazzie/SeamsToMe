// filepath: c:\Users\thump\SeemsToMe\src\index-complete-workflow.ts
/**
 * PURPOSE: Entry point for the complete workflow demonstration
 * DATA FLOW: Entry point → Example → Agents
 * INTEGRATION POINTS: All agents through example
 * CONTRACT VERSION: v1
 * ERROR HANDLING: Top-level error handling and logging
 */

// Import the example dynamically to avoid circular dependencies
export async function runCompleteWorkflowExample() {
  const example = await import('./examples/checklist-changelog-docs-integration');
  return example.runCompleteWorkflowExample();
}

// If this file is run directly, run the example
if (require.main === module) {
  runCompleteWorkflowExample()
    .then(() => console.log('Complete workflow demo completed successfully'))
    .catch(error => {
      console.error('Complete workflow demo failed:', error);
      process.exit(1);
    });
}
