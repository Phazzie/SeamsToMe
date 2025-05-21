<!-- filepath: c:\Users\thump\SeemsToMe\docs\seams\orchestrator-checklist-seam.md -->
# Seam Template: Orchestrator-Checklist

## Seam Overview

**Seam ID**: ORCH-CHECK-001  
**Version**: v1  
**Last Updated**: May 17, 2025  
**Status**: ACTIVE  

## Connected Agents

| Agent | Role | Direction |
|-------|------|-----------|
| Orchestrator | CONSUMER | OUT |
| Checklist | PROVIDER | IN |

## Contract Definition

This seam uses two primary contracts:

1. The OrchestratorContract for task submission and coordination
2. The ChecklistContract for specific checklist functionality

### Data Flow

1. Orchestrator submits tasks to the Checklist Agent using TaskRequest/TaskResponse
2. Checklist Agent exposes specialized methods via ChecklistContract
3. Results are returned to the Orchestrator

### Methods/Endpoints

Primary methods used across this seam:

```typescript
// From OrchestratorContract
submitTask(request: TaskRequest): Promise<TaskResponse>;

// From ChecklistContract
checkCompliance(request: ChecklistRequest): Promise<ChecklistResponse>;
getCategories(): Promise<ChecklistCategory[]>;
generateReport(targetPath: string, format: string): Promise<string>;
```

## Error Handling Strategy

- **Error Types**:
  - TaskSubmissionError: Failures in task submission
  - ValidationError: Invalid checklist request parameters
  - ComplianceCheckError: Errors during compliance checking
  - ReportGenerationError: Errors in generating reports

- **Responsibility**:
  - Orchestrator handles task submission errors
  - Checklist agent handles domain-specific errors
  - Both sides validate their inputs

- **Recovery**:
  - Retries for transient errors (max 3 attempts)
  - Clear error messages for validation issues
  - Partial results returned when possible

## Versioning Strategy

- **Compatibility**: All changes to the Checklist contract are versioned
- **Migration**: Breaking changes require explicit migration period
- **Deprecation**: Methods are marked deprecated before removal

## Design Rationale

- **Purpose**: Enable SDD compliance verification across the system
- **Alternatives**: Considered direct integration but preferred the task-based approach
- **Constraints**: Needed to work with the existing task system
- **Future Expansion**: Will add real-time compliance monitoring

## Testing Requirements

- **Contract Conformance**:
  - Verify all methods return expected types
  - Test serialization/deserialization of complex objects
  - Verify error handling conforms to contract

- **Edge Cases**:
  - Test with missing categories
  - Test with invalid paths
  - Test with extremely large reports

- **Performance**:
  - Report generation should complete within 5 seconds
  - Compliance checks should handle large codebases
