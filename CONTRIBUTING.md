# Contributing to SeemsToMe

Thank you for your interest in improving SeemsToMe! This guide explains our SDD (Seam-Driven Development) contribution process.

## SDD Contribution Workflow

### 1. **Understanding First**

- Read the [SDD Manifesto](docs/sdd-manifesto.md)
- Review the [Agent Catalog](docs/agent-catalog.md)
- Follow [ONBOARDING.md](ONBOARDING.md) steps

### 2. **Identify the Seams**

Before modifying or creating new agents/components:

- Identify all affected seams/contracts
- Use the seam template for new seams
- Consult the orchestrator agent for seam guidance

### 3. **Contract-First Development**

- **Define/update contracts before implementation**
- Use explicit versioning for contract changes
- Include blueprint comments explaining seam purpose

### 4. **Stub Everything Early**

- Create stubs with minimal/no logic
- Raise `NotImplementedError` or return placeholders
- Use Better Comments for TODOs and questions

### 5. **Test Seams First**

- Write contract conformance tests before implementation
- Test error handling explicitly at seam boundaries
- Mock dependencies to isolate seam behavior

### 6. **Documentation**

- Update agent catalog for new/modified agents
- Keep seam visualization up to date
- Document contract changes and versioning

### 7. **Pull Request Process**

- Reference affected seams in PR description
- Include contract conformance test results
- Follow the [commit message format](docs/conventions.md)

## FAQ

**Q: What if I need to change a contract?**
A: Version the contract explicitly, notify all consumers, and provide adapters for backward compatibility when possible.

**Q: Can I implement logic without a contract?**
A: No. In SDD, contracts/interfaces must be defined and stubbed before implementation.

**Q: How detailed should my blueprint comments be?**
A: They should describe purpose, data flow, integration points, contract version, and error handling strategy.

**Q: What if I discover a new seam while implementing?**
A: Stop, define the new seam using the seam template, create a stub, and continue.

## Need Help?

Consult the Orchestrator agent owner or check the SDD documentation for guidance.
