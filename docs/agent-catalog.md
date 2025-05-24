# SeemsToMe Agent Catalog

This document lists every agent planned for the SeemsToMe project, with a highly detailed and comprehensive explanation of each agent's responsibilities, interfaces, and unique features. Each agent is designed to support Seam-Driven Development principles and help break through the "70% Wall" in AI-assisted development.

The agents work together to implement the SDD "Moneyball" strategy - targeting high-leverage activities (contracts, seams, tests) that yield disproportionate returns in system quality and development velocity.

---

## 1. Checklist & Changelog Agent

**Purpose:**

- Tracks project progress, tasks, milestones, and important changes/decisions.
- Maintains a living checklist and changelog, supporting search, filtering, and export.
  **Key Features:**
- Add, edit, complete, and remove checklist items.
- Log changes and decisions with timestamps and context.
- Seam: User/Orchestrator ↔ Checklist Agent (CRUD operations, status, error reporting).

## 2. Seam Knowledge Agent (Conversation Recorder + Evolution Tracker)

**Purpose:**

- Captures design discussions, rationales, and the evolution of every seam/contract.
- Maintains a searchable, versioned history of all seams and their changes.
  **Key Features:**
- Link conversations and decisions to specific seams/contracts.
- Visualize seam evolution and rationale over time.
- Seam: All agents ↔ Knowledge Agent (record/query rationale, notify on changes).

## 3. PRD/Design Doc Generator

**Purpose:**

- Converts user/agent discussions into structured Product Requirements Documents (PRDs) and design docs.
  **Key Features:**
- Extracts requirements, features, user stories, and open questions.
- Detects ambiguities and prompts for clarification.
- Seam: User/Orchestrator ↔ PRD Agent (input: discussion, output: PRD/design doc).

## 4. SDD Orchestrator Agent

**Purpose:**

- Guides and enforces the SDD process and agent workflow.
- Coordinates agent actions and ensures correct order of operations.
  **Key Features:**
- Delegates tasks, enforces contract-first rules, manages agent state.
- Seam: Orchestrator ↔ All agents (task delegation, status, error handling).

## 5. Stub/Scaffolding Agent (MVPSddScaffolderAgent)

**Purpose:**

- Generates file stubs and blueprint comments for all components and seams.
- Automates the creation of initial agent, contract, and test files based on user-provided inputs.

**Key Features:**

- Creates syntactically correct skeletons with top-level comments.
- Links stubs to seam map and documentation.
- Supports different SDD component types (Agent, Contract, Test, Full Set).
- Handles file overwrite policies (Overwrite, Skip, Error).
- Outputs the paths and content of generated files.

**Contract:** `IMVPSddScaffolderAgent`

- Method: `generateSddScaffold(request: MVPSddScaffoldRequest): Promise<ContractResult<MVPSddScaffoldOutput, AgentError>>`
- Input: `componentName`, `sddComponentType`, `targetDirectory`, `overwritePolicy`, `requestingAgentId`.
- Output: `summaryMessage`, `generatedFiles` (paths), `generatedFileContents` (path + content), `skippedFiles`, `targetDirectory`, `componentName`, `sddComponentType`.

- Seam: Orchestrator/PRD ↔ Stub Agent (input: design doc/request, output: stubs/scaffolded files).

## 6. Seam Analyzer Agent

**Purpose:**

- Analyzes design docs and stubs to identify seams, contracts, integrations, and required tests.
  **Key Features:**
- Outputs a checklist/table of seams and integration points.
- Suggests seam health metrics and risk areas.
- Seam: Orchestrator/PRD ↔ Analyzer (input: docs/stubs, output: seam map).

## 7. Seam Quality Agent (QA/Guardian + Docs + Refactor)

**Purpose:**

- Ensures SDD compliance, code quality, and documentation.
- Suggests refactors for complex/tangled seams.
  **Key Features:**
- Runs checklists, lints code, flags violations, and reviews seam health.
- Generates/upgrades living documentation from seams.
- Seam: Orchestrator ↔ Quality Agent (input: codebase, output: reports, suggestions).

## 8. Seam-Driven AI Pair Programmer

**Purpose:**

- Implements code only within defined seams, asking for clarification if a seam is ambiguous or missing.
  **Key Features:**
- Consults seam contracts and stubs before generating code.
- Interacts with user/agents for clarification and feedback.
- Seam: Orchestrator ↔ AI Pair Programmer (input: task, output: code, questions).

## 9. Prompt Generator Agent

**Purpose:**

- Breaks down design docs and stubs into granular, detailed prompts for Copilot/LLMs.
- Transforms SDD artifacts (contracts, stubs) into optimal prompts for AI code generation.
- Serves as a bridge between SDD methodology and AI implementation.

**Key Features:**

- Generates, scores, and iteratively improves prompts based on SDD artifacts.
- Creates context-appropriate prompts that fit within AI context windows.
- Crafts prompts that clearly communicate contract requirements to AI.
- Supports both manual and automatic prompt feeding.
- Adapts prompt complexity based on user expertise level.
- Includes relevant contract details to constrain AI generation appropriately.

**Seams:**

- Orchestrator/PRD ↔ Prompt Agent (input: docs, output: prompts)
- Prompt Agent ↔ AI Pair Programmer (optimized prompts for implementation)
- Prompt Agent ↔ Contract Registry (access to contract details for prompt creation)

## 10. API Doc Reader Agent

**Purpose:**

- Reads and summarizes API documentation from a URL, extracting endpoints, authentication, and usage patterns.
  **Key Features:**
- Suggests integration points and auto-generates test stubs or Postman collections.
- Seam: User/Orchestrator ↔ API Agent (input: URL, output: summary, integration data).

## 11. Seam-Driven Documentation Generator

**Purpose:**

- Builds and upgrades living documentation directly from seam contracts, stubs, and comments.
  **Key Features:**
- Ensures docs are always up-to-date and reflect the real architecture.
- Seam: Orchestrator/Quality Agent ↔ Doc Generator (input: contracts, output: docs).

## 12. Seam-Driven Refactoring Assistant

**Purpose:**

- Suggests and assists with refactoring seams that become too complex or tightly coupled.
  **Key Features:**
- Analyzes seam health, coupling, and change frequency.
- Proposes and helps implement refactorings.
- Seam: Orchestrator/Quality Agent ↔ Refactor Agent (input: seam map, output: refactor plan).

## 13. Metrics & Dashboard Agent

**Purpose:**

- Collects, analyzes, and visualizes SDD metrics across the system.
- Provides insights into seam health, quality, and SDD effectiveness.
- Monitors progress through the "70% Wall" in AI-assisted development.

**Key Features:**

- Tracks key metrics defined in SDD-metrics.md.
- Visualizes seam stability and health over time.
- Identifies high-risk seams that need attention.
- Generates reports on AI code generation efficiency within SDD framework.

**Seams:**

- Orchestrator ↔ Metrics Agent (system-wide metric collection)
- Metrics Agent ↔ All Agents (individual metrics collection)
- Metrics Agent ↔ Knowledge Agent (historical trend analysis)

## 14. Contract Registry Agent

**Purpose:**

- Maintains the central repository of all contracts in the system.
- Manages versioning, dependencies, and lifecycle of contracts.
- Serves as the single source of truth for contract definitions.

**Key Features:**

- Provides a centralized registry of all contracts with metadata.
- Manages contract versioning, deprecation, and compatibility.
- Validates contract changes for backward compatibility.
- Supports AI code generation by providing stable contract references.
- Alerts on breaking changes and coordination of migrations.

**Seams:**

- Contract Registry ↔ All Agents (contract reference and validation)
- Contract Registry ↔ Knowledge Agent (contract history and rationale)
- Contract Registry ↔ Changelog Agent (tracking contract evolution)

## 15. MVP SDD Scaffolder Agent

**Purpose:**

- To scaffold new Seam Driven Development (SDD) components (such as agents, contracts, and tests) based on predefined templates and user input.
- It acts as a meta-agent, helping to create the foundational structure for other agents and their associated SDD artifacts within the "SeemsToMe" ecosystem.

**Key Features:**

- Generates file structures for new SDD components (e.g., `*.agent.ts`, `*.contract.ts`, `*.contract.test.ts`).
- Utilizes predefined templates to ensure consistency with SDD principles.
- Takes user input for component names, types, and target locations.
- Provides feedback on the scaffolding process and generated files.

**Seams:**

- **Input:** User/OrchestratorAgent ↔ MVPSddScaffolderAgent (Request: component name, type, target directory, template variables. Response: overallStatus, generatedFiles [paths of generated files], generatedFileContents [details of content]).
- **Output (Conceptual File System Operations):** MVPSddScaffolderAgent → FileSystem (Creates/modifies files based on templates).
- **Dependencies (Future):**
  - May rely on a `TemplateManagementAgent` for accessing and managing scaffolding templates.
  - Could interact with a `ProjectKnowledgeAgent` to understand existing project structure and naming conventions.

---

This catalog is a living document. Update it as agents are added, changed, or consolidated.
