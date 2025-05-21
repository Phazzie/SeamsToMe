# SeemsToMe: Seam-Driven Development (SDD) Multi-Agent System

Welcome to SeemsToMe! This project is built using Seam-Driven Development (SDD), a contract-first, integration-first methodology for robust, maintainable, and AI-friendly software.

## Quick Links

- [SDD Manifesto](docs/sdd-manifesto.md)
- [SDD Minimal Workflow](docs/sdd-minimal-workflow.md)
- [Agent Catalog](docs/agent-catalog.md)
- [Project Plan](docs/project-plan.md)
- [SDD Metrics](docs/sdd-metrics.md)
- [SDD Error Handling](docs/sdd-error-handling.md)
- [SDD Monitoring](docs/sdd-monitoring.md)
- [Agent Template](docs/agents/agent-template.md)
- [Seam Template](docs/seams/seam-template.md)
- [FAQ & Troubleshooting](docs/FAQ.md)
- [Contributing Guidelines](CONTRIBUTING.md)
- [Code Review Checklist](docs/code-review-checklist.md)

## SDD Quickstart

1. **Read the SDD Manifesto** for core principles, process, and AI integration strategy.
2. **Review the Agent Catalog** to understand the system's agents and seams.
3. **Follow the ONBOARDING.md** for step-by-step SDD onboarding.
4. **Use VS Code tasks** to open docs and check SDD compliance.

## SDD Principles (Summary)

- **Contract-first**: Define all seams/contracts before implementation.
- **Stub everything early**: Minimal logic, blueprint comments.
- **Test seams before internals**: Verify contracts work before building components.
- **Document and visualize all seams**: Make architecture explicit and visible.
- **Break the "70% Wall"**: SDD is designed to overcome limitations in AI-generated code.
- **Measure seam effectiveness**: Use metrics to evaluate and improve seam quality.

## SDD and AI Development

SDD applies a "Moneyball" strategy to AI-assisted development:

- Front-load the architectural decisions that AI struggles with
- Create clear boundaries for AI to work within
- Enable AI to focus on implementing against stable contracts
- Avoid the "70% Wall" where traditional AI code generation stalls

## Planned Features

- [Contract IDE](docs/features/contract-ide.md): Specialized tooling for contract creation and management
- Seam Visualization: Interactive graphs of system architecture
- Metrics Dashboard: Monitor seam health and SDD effectiveness
- AI Integration: Advanced AI assistance for SDD workflows

## Extensions (Recommended)

- GitHub Copilot
- Prettier (JS/TS)
- Black (Python)
- Pylint
- Markdown Preview Enhanced
- Better Comments
- Draw.io Integration
- Mermaid Markdown Syntax Highlighting

See `.vscode/extensions.json` for auto-recommendations.

---

For full onboarding, see [ONBOARDING.md](ONBOARDING.md).
