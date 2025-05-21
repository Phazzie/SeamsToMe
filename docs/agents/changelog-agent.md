<!-- filepath: c:\Users\thump\SeemsToMe\docs\agents\changelog-agent.md -->
# Agent Template: Changelog Agent

## Agent Overview

**Agent ID**: CHANGELOG-001  
**Version**: v1  
**Last Updated**: May 17, 2025  
**Status**: ACTIVE  
**Owner**: SeemsToMe Team

## Purpose & Responsibilities

The Changelog Agent tracks and documents changes across the system, with special focus on contract changes, ensuring a clear history of system evolution.

- Record changes with detailed metadata
- Track breaking changes separately
- Generate formatted changelogs
- Provide migration guidance for breaking changes
- Support filtering changes by various criteria

## Connected Seams

| Seam ID | Role | Purpose |
|---------|------|---------|
| ORCH-CHANGE-001 | PROVIDER | Receive change recording requests from the Orchestrator |
| CHANGE-DOC-001 | PROVIDER | Provide change data to the Documentation Agent |

## Agent Behavior

### Core Workflow

1. Receive change record request
2. Store change with complete metadata
3. Identify breaking changes
4. Generate appropriate changelog formats

### State Management

The Changelog Agent maintains a persistent store of changes.

### Error Handling Strategy

- Validation errors for change records are reported clearly
- Change recording failures are retried
- Concurrency conflicts are resolved using timestamps

## Implementation Guide

### Prerequisites

- Persistent storage for changes
- Markdown generation capabilities
- Date/time handling for change filtering

### Key Components

- Change Recorder: Records and stores changes
- Change Filter: Filters changes based on criteria
- Changelog Generator: Formats changes into readable changelogs

### Blueprint Comments

Key blueprint comments that should be included in the implementation:

```typescript
/**
 * PURPOSE: Track and document changes across the system
 * DATA FLOW: Changelog Agent ↔ Orchestrator
 * INTEGRATION POINTS: Orchestrator, Documentation Agent
 * CONTRACT VERSION: v1
 * ERROR HANDLING: Contextual error reporting with specific error types
 */
```

## Testing Requirements

- Contract conformance tests for the ChangelogContract
- Tests for various change types
- Tests for filtering capabilities
- Tests for generating different changelog formats
