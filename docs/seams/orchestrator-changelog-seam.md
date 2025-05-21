<!-- filepath: c:\Users\thump\SeemsToMe\docs\seams\orchestrator-changelog-seam.md -->
# Seam Template: Orchestrator-Changelog

## Seam Overview

**Seam ID**: ORCH-CHANGE-001  
**Version**: v1  
**Last Updated**: May 17, 2025  
**Status**: ACTIVE  

## Connected Agents

| Agent | Role | Direction |
|-------|------|-----------|
| Orchestrator | CONSUMER | OUT |
| Changelog | PROVIDER | IN |

## Contract Definition

This seam uses two primary contracts:

1. The OrchestratorContract for task submission and coordination
2. The ChangelogContract for specific changelog functionality

### Data Flow

1. Orchestrator submits tasks to the Changelog Agent using TaskRequest/TaskResponse
2. Changelog Agent exposes specialized methods via ChangelogContract
3. Results are returned to the Orchestrator

### Methods/Endpoints

Primary methods used across this seam:

```typescript
// From OrchestratorContract
submitTask(request: TaskRequest): Promise<TaskResponse>;

// From ChangelogContract
recordChange(request: RecordChangeRequest): Promise<string>;
getChanges(request: ChangelogRequest): Promise<ChangelogResponse>;
generateChangelog(request: ChangelogRequest, format: string): Promise<string>;
getBreakingChanges(since?: Date): Promise<ChangeRecord[]>;
```

## Error Handling Strategy

- **Error Types**:
  - TaskSubmissionError: Failures in task submission
  - ValidationError: Invalid changelog request parameters
  - ChangeRecordingError: Errors during change recording
  - ChangelogGenerationError: Errors in generating changelogs

- **Responsibility**:
  - Orchestrator handles task submission errors
  - Changelog agent handles domain-specific errors
  - Both sides validate their inputs

- **Recovery**:
  - Retries for transient errors (max 3 attempts)
  - Clear error messages for validation issues
  - Partial results returned when possible

## Versioning Strategy

- **Compatibility**: All changes to the Changelog contract are versioned
- **Migration**: Breaking changes require explicit migration period
- **Deprecation**: Methods are marked deprecated before removal

## Design Rationale

- **Purpose**: Track changes across the system, especially contract changes
- **Alternatives**: Considered git-based change tracking but needed more structure
- **Constraints**: Needed to work with the existing task system
- **Future Expansion**: Will add automated change detection and impact analysis

## Testing Requirements

- **Contract Conformance**:
  - Verify all methods return expected types
  - Test serialization/deserialization of complex objects
  - Verify error handling conforms to contract

- **Edge Cases**:
  - Test with complex filtering criteria
  - Test with extremely large changelogs
  - Test with invalid date ranges

- **Performance**:
  - Change recording should be quick (< 100ms)
  - Changelog generation should complete within 3 seconds
