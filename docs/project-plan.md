# SeemsToMe: High-Level Project Plan

## Project Vision

SeemsToMe is a modular, AI-powered development assistant platform built using Seam-Driven Development (SDD). It helps users architect, scaffold, implement, and maintain software projects by leveraging a team of specialized agents, each with clear contracts and responsibilities.

## What is Seam-Driven Development (SDD)?

Seam-Driven Development (SDD) is a contract-first, integration-first software development methodology designed to maximize clarity, testability, and maintainability—especially in AI-assisted or multi-agent projects.

**Core Principles:**

- **Contract-First:** Explicitly define all interfaces ("seams") and data contracts between components before building internal logic.
- **Stub Everything Early:** Create skeletal implementations (stubs) for all seams, with top-level comments explaining purpose, data flow, and integration points.
- **Blueprint Comments:** Comments in contract/stub files act as architectural blueprints, describing the "why" and "how" of each seam.
- **Testable Seams:** Seams and stubs must be testable and verified before deeper implementation begins.
- **AI-First Enablement:** SDD is designed to play to AI’s strengths (clear specs, isolated tasks) and avoid its weaknesses (integration ambiguity, the "70% wall").
- **Non-Negotiable Foundation:** No real implementation is allowed until seams are architected, stubbed, and verified.

**Why SDD?**
Traditional development often blurs the lines between component internals and their connections, leading to integration pain and unclear boundaries. SDD flips this by making seams—the explicit, documented joints between parts—the primary architectural artifact. This approach ensures that:

- Integration is always clear and intentional
- AI or human coders can work efficiently within well-defined boundaries
- The system remains robust as it grows and changes

**How SDD Works in Practice:**

1. **Architect Seams:** Identify and define all key interfaces and data contracts between components.
2. **Stub and Document:** Create stub files for each seam, with top-level comments describing their purpose, information flow, and integration points.
3. **Test Seams:** Write and run tests to verify that seams and stubs behave as expected.
4. **Implement Internals:** Only after seams are stable and verified, implement the internal logic of each component.
5. **Guard the Seams:** Continuously monitor and review seams to ensure they remain correct and unbroken as the system evolves.

SDD is especially powerful for AI-assisted coding, as it channels the strengths of AI (working to clear specs) and prevents common pitfalls (integration ambiguity, incomplete context, and the "last 30%" problem).

## Objectives

- Make complex software development approachable for all skill levels
- Use SDD to ensure robust, maintainable, and testable code
- Enable incremental, agent-driven workflows
- Provide clear documentation, history, and rationale for all architectural decisions

## Agent List (with brief descriptions)

- **Checklist & Changelog Agent**: Tracks project progress, tasks, and changes
- **Conversation Recorder (Seam Knowledge Agent)**: Captures design discussions and rationales
- **PRD/Design Doc Generator**: Converts discussions into structured design docs
- **SDD Orchestrator Agent**: Guides and enforces the SDD process and agent workflow
- **Stub/Scaffolding Agent**: Generates file stubs and blueprint comments
- **Seam Analyzer Agent**: Identifies seams, contracts, and integrations
- **QA/Guardian Agent**: Ensures SDD compliance and code quality
- **Seam-Driven AI Pair Programmer**: Implements code within defined seams
- **Prompt Generator Agent**: Breaks down design docs into granular prompts
- **API Doc Reader Agent**: Summarizes and extracts info from API documentation
- **Seam-Driven Documentation Generator**: Builds/upgrades living docs from seams
- **Seam-Driven Refactoring Assistant**: Suggests refactors for complex seams
- **Seam Evolution Tracker**: Tracks seam history and changes
- **MVP SDD Scaffolder Agent**: Scaffolds new SDD components (agents, contracts, tests) based on templates.

## SDD Principles

- Contract-first, integration-first
- Explicit seams/interfaces with stubs and blueprint comments
- Testable seams before implementation
- AI/human implementation only after seams are defined and verified

## Development Roadmap

1. Checklist & Changelog Agent
2. Conversation Recorder
3. PRD/Design Doc Generator
4. SDD Orchestrator Agent
5. Stub/Scaffolding Agent
6. Seam Analyzer Agent
7. QA/Guardian Agent
8. Seam-Driven AI Pair Programmer
9. Prompt Generator Agent
10. API Doc Reader Agent
11. Seam-Driven Documentation Generator
12. Seam-Driven Refactoring Assistant
13. Seam Evolution Tracker
14. **MVP SDD Scaffolder Agent (Current Focus)**

## Integration & Testing Strategy

- Each agent is built and tested independently
- Agents communicate via explicit seams/contracts
- Integration tests ensure agents work together as intended

## Orchestrator Agent

- Central to managing workflow, enforcing SDD, and coordinating agent actions
- Ensures agents are used in the correct order and that SDD rules are followed

---

This document is a living artifact and should be updated as the project evolves.
