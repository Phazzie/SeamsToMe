# Seam-Driven Development (SDD) Manifesto

## Purpose

This document is the definitive guide to Seam-Driven Development (SDD), a contract-first, integration-first methodology for building robust, maintainable, and AI-friendly software systems. It is intended as both a practical manual and a philosophical foundation for all SDD projects, including SeemsToMe.

---

## 1. SDD Core Principles

- **Contract-First:** Explicitly define all interfaces ("seams") and data contracts before building internal logic.
- **Stub Everything Early:** Create skeletal implementations (stubs) for all seams, with top-level blueprint comments explaining purpose, data flow, and integration points.
- **Blueprint Comments:** Comments in contract/stub files act as architectural blueprints, describing the "why" and "how" of each seam.
- **Testable Seams:** Seams and stubs must be testable and verified before deeper implementation begins.
- **AI-First Enablement:** SDD is designed to play to AI's strengths (clear specs, isolated tasks) and avoid its weaknesses (integration ambiguity, the "70% wall").
- **Non-Negotiable Foundation:** No real implementation is allowed until seams are architected, stubbed, and verified.

---

## 2. SDD Process Overview

1. **Architect Seams:** Identify and define all key interfaces and data contracts between components.
2. **Stub and Document:** Create stub files for each seam, with top-level comments describing their purpose, information flow, and integration points.
3. **Test Seams:** Write and run tests to verify that seams and stubs behave as expected.
4. **Implement Internals:** Only after seams are stable and verified, implement the internal logic of each component.
5. **Guard the Seams:** Continuously monitor and review seams to ensure they remain correct and unbroken as the system evolves.

---

## 3. SDD in Practice: Detailed Guidance

### Seam Granularity

- A seam should represent a single, cohesive point of interaction or well-defined data exchange.
- Combine small, tightly related interactions; split large seams with disparate responsibilities or change rates.
- Litmus test: Can you describe the seam’s purpose in one clear sentence?

### Evolving Contracts

- Treat contracts like public APIs: aim for backward compatibility.
- Use explicit versioning (e.g., v1, v2) for breaking changes.
- Use adapters/facades for gradual migration.
- Communicate all changes; use a central registry and evolution tracker.

### Testing Philosophy

- Write contract conformance and behavioral tests before or alongside glue code.
- Use property-based and unit tests as needed.
- Integration tests should mock internals but use real contracts and glue.

### Human-AI Collaboration

- Humans define and approve intent; AI drafts contracts, stubs, and tests.
- Shared contract repository is the single source of truth.
- Orchestrator agent manages workflow and review.

### Seam Discovery

- Use event storming, responsibility-driven analysis, and “what if this changes?” prompts to uncover hidden seams.
- Trace data lifecycles and handoffs for seam identification.

### Seam Documentation

- The contract file IS the documentation: include purpose, participants, data flow, behaviors, error handling, version, and rationale.
- Use visualizations (e.g., Mermaid graphs) for architecture clarity.

### Seam Ownership

- Provider stewards the contract; consumers co-design and must agree.
- Contract agent manages registry and versioning; orchestrator oversees usage.
- Notify all consumers of changes; track with evolution tracker.

### Seam Failure Modes & Prevention

- Data mismatches, behavioral misunderstandings, error handling incompatibility, version drift, and breaking changes are common failures.
- SDD prevents these with hyper-specific contracts, integration tests, versioning, and documentation.

### Seam Visualization

- Use automated, interactive, color-coded graphs to show seam status and relationships.
- Allow drill-down for contract details and test status.

### SDD Beyond Code

- Apply SDD to workflows, documentation, and team responsibilities.
- Define and test handoffs, cross-references, and deliverables as seams/contracts.

---

## 4. SDD Anti-Patterns to Avoid

- Implicit contracts (undocumented interfaces)
- Tight coupling between agent internals
- "God Agent" syndrome (one agent does too much)
- Untracked state/side effects
- Integration as an afterthought
- Skipping stub/test phases
- Poor error handling
- Version drift without communication

---

## 5. SDD in SeemsToMe: Example Application

- First seam: User ↔ Checklist & Changelog Agent (define data structures, methods, error/status reporting)
- Stubs: Implement interface methods with blueprint comments and mock returns
- Tests: Write integration tests for seam before internal logic
- Versioning: Use explicit contract versions and notify all consumers
- Visualization: Generate and update seam graphs as agents are added

---

## 6. SDD Manifesto

- We believe that robust, maintainable, and AI-friendly systems are built on explicit, testable, and well-documented seams.
- We commit to defining, documenting, and testing all contracts before implementation.
- We value clarity, collaboration, and continuous improvement in all our seams.
- We recognize that SDD is a living process, evolving with our systems and our understanding.

---

## 7. SDD and AI Code Generation: Breaking the "70% Wall"

### The 70% Wall Problem

AI code generators often excel at creating individual components or simple applications but struggle with complex integration, architecture maintenance, and system-wide coherence. This creates a "70% Wall" where:

- Initial code generation is rapid (0-70%)
- Progress then slows dramatically or stalls (70-100%)
- Integration issues multiply exponentially
- Context limitations lead to architectural blindness
- Debugging becomes increasingly difficult

### How SDD Breaks Through the Wall

SDD intentionally front-loads the difficult architectural decisions that AI struggles with:

- **Clear Boundaries:** Contracts create explicit guardrails for AI to work within, preventing architectural drift
- **Focused Generation:** AI can concentrate on implementing one contract at a time without requiring full system context
- **Validation Points:** Seam tests provide immediate feedback on contract conformance
- **Integration First:** By defining and testing integrations before implementation, we avoid the most common AI pitfall

### The "Moneyball" Strategy of SDD

SDD applies a "Moneyball" philosophy by:

- Investing heavily in high-leverage activities (contracts, seams, tests) that yield disproportionate returns
- Creating force-multiplier effects for AI code generation
- Targeting the specific weaknesses in the AI development lifecycle
- Turning integration from a liability into a strength

This approach allows both human and AI developers to focus on high-value creative work while maintaining system integrity.

---

## 8. SDD Beyond Agent Systems

While SeemsToMe applies SDD to multi-agent AI systems, the methodology is equally effective for:

- Traditional software components
- Microservices architecture
- Layers within monolithic applications
- Human-AI collaborative development
- Any system with multiple integration points

The core principles of contract-first design, seam testing, and blueprint documentation provide benefits regardless of system type.

---

## 9. SDD for AI-Assisted Novices

### Scaffolding for Growth

SDD provides a structured approach that helps developers without extensive traditional coding backgrounds:

- **Architectural Thinking Without Architectural Experience:** Learn system design principles through the practical application of contracts and seams
- **Guided Decision-Making:** The step-by-step SDD process provides clear decision points and structures
- **Progressive Complexity:** Start with simple contracts and gradually introduce more complex patterns as understanding grows

### Reducing Cognitive Load

SDD significantly reduces the mental burden for AI-assisted developers by:

- **Compartmentalization:** Breaking systems into clearly defined pieces with explicit boundaries
- **Focused Problem-Solving:** Allowing developers to concentrate on one seam or component at a time
- **Simplified Debugging:** When issues arise, the contract boundaries make it clear where to look
- **Delegating Complexity:** Letting AI handle implementation details while humans focus on architectural decisions

### SDD as Guided Prompt Engineering

For developers using AI as their primary implementation engine, SDD transforms into a powerful prompt engineering framework:

- **From Contracts to Prompts:** Well-defined seams and contracts naturally translate into clear, focused prompts for AI
- **Prompt Boundaries:** Contracts establish natural context boundaries that fit within AI context windows
- **Incremental AI Tasks:** The SDD lifecycle creates a series of well-scoped AI tasks rather than overwhelming requests
- **Feedback Loop:** Contract tests provide immediate validation of AI-generated implementations

### Optimizing for AI Reliability

SDD creates an environment where AI is more reliable by:

- **Clear Instructions:** Contracts serve as precise, unambiguous instructions for AI code generation
- **Constrained Creativity:** AI innovation happens within well-defined boundaries, reducing the risk of going off-track
- **Verifiable Outputs:** Contract-based testing creates clear validation criteria for AI-generated code
- **Recover from Failure:** When AI implementations fall short, the clear contract makes it easy to identify what's missing

### Simplicity First Approach

For novice developers, SDD should prioritize:

1. **Hyper-Specific Data Contracts:** Clear, detailed data structures with explicit types and constraints
2. **Minimal Viable Seam Testing:** Simple validation that contracts are being fulfilled
3. **Blueprint Comments:** Extensive documentation within code to guide AI implementation
4. **Incremental Expansion:** Start with core seams and gradually expand the system

---

This document is a living artifact. Update it as SDD evolves and as SeemsToMe grows.
