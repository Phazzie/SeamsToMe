# SeemsToMe Onboarding (SDD)

Welcome! This guide will get you (human or AI) up to speed with SDD and the SeemsToMe agent ecosystem.

## 1. Read First

- [SDD Manifesto](docs/sdd-manifesto.md): Core principles, process, anti-patterns, and AI synergy.
- [Agent Catalog](docs/agent-catalog.md): All agents, seams, and contracts.
- [SDD Metrics](docs/sdd-metrics.md): How to measure seam effectiveness and SDD success.

## 2. Setup

- Install recommended VS Code extensions (see below).
- Open VS Code tasks (Ctrl+Shift+B) for onboarding and docs.

## 3. SDD Workflow Checklist

- [ ] Identify and define new seams/contracts using the [seam template](docs/seams/seam-template.md).
- [ ] Stub all new seams with blueprint comments and placeholder logic.
- [ ] Write contract and integration tests before implementing internals.
- [ ] Update documentation and visualizations for all changes.
- [ ] Establish metrics for seam health monitoring.
- [ ] Use Better Comments for TODOs, questions, and highlights in code.
- [ ] Review for "70% Wall" breakthrough opportunities.

## 4. Extensions

- GitHub Copilot
- Prettier, Black, Pylint
- Markdown Preview Enhanced
- Better Comments
- Draw.io Integration
- Mermaid Markdown

## 5. Resources

- [Project Plan](docs/project-plan.md)
- [Agent Template](docs/agents/agent-template.md)
- [Seam Template](docs/seams/seam-template.md)
- [FAQ & Troubleshooting](docs/FAQ.md)
- [Contributing Guidelines](CONTRIBUTING.md)
- [Code Review Checklist](docs/code-review-checklist.md)

## 6. AI-First Development with SDD

- Define clear contracts within AI context window limitations
- Use blueprint comments to guide AI implementations
- Ensure seam tests provide validation points for AI-generated code
- Focus AI on implementing against stable contracts
- Track AI code generation metrics to measure SDD effectiveness

## 7. SDD for Non-Traditional Developers

SDD is particularly valuable if you don't have extensive traditional coding or architectural experience. Here's how to leverage it effectively:

### Getting Started

- Start with the [SDD Minimal Workflow](docs/sdd-minimal-workflow.md) for a simplified approach
- Focus first on mastering clear contract definitions before other aspects
- Use our prompt templates when working with AI assistants

### Building Architectural Skills

- Begin with simpler seams between just two components
- Use the blueprint comments as a way to think through system design
- Learn architecture by describing the "why" behind your contract decisions
- Study the seam visualizations to understand system relationships

### Managing Complexity

- Break down complex problems into smaller, well-defined seams
- Let AI handle implementation details while you focus on the interfaces
- Use contracts as a way to explicitly document your understanding
- Create simple diagrams to visualize component relationships

### Effective AI Collaboration

- Think of contracts as "precise instructions" for your AI assistant
- Include detailed comments that explain your intentions
- Start with smaller, focused prompts based on individual contracts
- Use the generated tests as validation of AI-generated implementations

Remember that SDD was designed specifically to help developers like you leverage AI effectively while building robust systems. The structure it provides helps develop your architectural thinking while ensuring your AI assistant has clear boundaries to work within.

## 8. Need Help?

- Check the [FAQ](docs/FAQ.md) for common questions
- Review the [Code Review Checklist](docs/code-review-checklist.md) for guidance
- Ask the orchestrator agent owner for assistance
- Consult the SDD Manifesto for principles and process
