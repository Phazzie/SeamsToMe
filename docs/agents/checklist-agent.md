<!-- filepath: c:\Users\thump\SeemsToMe\docs\agents\checklist-agent.md -->
# Agent Template: Checklist Agent

## Agent Overview

**Agent ID**: CHECKLIST-001  
**Version**: v1  
**Last Updated**: May 17, 2025  
**Status**: ACTIVE  
**Owner**: SeemsToMe Team

## Purpose & Responsibilities

The Checklist Agent verifies SDD compliance across the system, ensuring that contracts, seams, and implementations adhere to the SDD methodology.

- Validate contracts for proper blueprint comments and structure
- Verify seam documentation completeness
- Check implementation for SDD compliance
- Generate compliance reports
- Provide remediation guidance for non-compliant items

## Connected Seams

| Seam ID | Role | Purpose |
|---------|------|---------|
| ORCH-CHECK-001 | PROVIDER | Receive compliance check requests from the Orchestrator |
| CHECK-QUAL-001 | PROVIDER | Provide compliance data to the Quality Agent |

## Agent Behavior

### Core Workflow

1. Receive compliance check request for a target path
2. Analyze target for compliance across requested categories
3. Generate compliance summary and detailed findings
4. Return results including remediation suggestions

### State Management

The Checklist Agent is stateless, processing each request independently.

### Error Handling Strategy

- Invalid path errors are reported with clear messages
- Partial results are returned when possible
- Each non-compliant item includes specific remediation guidance

## Implementation Guide

### Prerequisites

- Access to source code and documentation files
- TypeScript parsing capabilities
- Markdown parsing capabilities

### Key Components

- Compliance Checker: Analyzes files for compliance
- Remediation Engine: Generates suggestions for fixing compliance issues
- Report Generator: Formats compliance findings

### Blueprint Comments

Key blueprint comments that should be included in the implementation:

```typescript
/**
 * PURPOSE: Verify SDD compliance and provide guidance
 * DATA FLOW: Checklist Agent ↔ Orchestrator
 * INTEGRATION POINTS: Orchestrator, Quality Agent
 * CONTRACT VERSION: v1
 * ERROR HANDLING: Detailed error reporting with remediation suggestions
 */
```

## Testing Requirements

- Contract conformance tests for the ChecklistContract
- Tests with various compliance scenarios
- Tests for each compliance category
- Tests with invalid inputs
