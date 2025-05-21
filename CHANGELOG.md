# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Initial `CHANGELOG.md` file.
- Created `docs/seam-driven-development-learnings.md` to document SDD process insights.
- Established and documented a detailed "Agent Stub Implementation Pattern" in `docs/seam-driven-development-learnings.md`.
- Added "Strategies for Preventing Common Mistakes" to `docs/seam-driven-development-learnings.md`.
- Created `refactor.contract.test.ts` to begin testing the `RefactorAgentContract`. This initial version includes tests for `analyzeCodeForRefactoring` and `applyRefactoring` methods, defining necessary types locally within the test file as these are not yet in the main `refactor.contract.ts`. Tests currently expect `NotImplementedError`.
- Added `MVPSddScaffolderAgent` to `docs/agent-catalog.md`.
- Planned development for `MVPSddScaffolderAgent`, starting with contract definition, agent stub, and initial contract tests.
- Implemented initial conceptual scaffolding logic in `MVPSddScaffolderAgent` for `SddComponentType.AGENT` (agent and contract files).
- Added contract tests for `MVPSddScaffolderAgent` covering `SddComponentType.AGENT`, including success and error conditions.
- Extended `MVPSddScaffolderAgent` to support `SddComponentType.FULL_AGENT_SET`, generating conceptual agent, contract, and test files.
- Updated contract tests for `MVPSddScaffolderAgent` to cover `SddComponentType.FULL_AGENT_SET`.
- Further extended `MVPSddScaffolderAgent` to support `SddComponentType.CONTRACT` and `SddComponentType.TEST` for individual file generation.
- Added contract tests for `MVPSddScaffolderAgent` covering `SddComponentType.CONTRACT` and `SddComponentType.TEST`.
- Created documentation for `MVPSddScaffolderAgent` in `docs/agents/mvpSddScaffolder-agent.md`.

### Changed

- Enhanced `MVPSddScaffolderAgent`:
  - Implemented overwrite strategy (`OverwritePolicy`: `ERROR_IF_EXISTS`, `OVERWRITE`, `SKIP`) for file generation, defaulting to `ERROR_IF_EXISTS`.
  - Improved logging within `generateSddScaffold`, `_scaffoldFullAgentSet`, and `_scaffoldSingleComponent` methods to provide detailed step-by-step operational insights and clear error reporting.
- **Agent Contracts & Stubs QA Pass (Completed for Stubs):**
  - Updated `src/contracts/contract-template.ts` with refined guidelines for `ContractResult` and type aliases.
  - Audited and updated all 8 new agent contracts (`prd`, `scaffold`, `analyzer`, `quality`, `pair`, `prompt`, `api-reader`, `refactor`) to align with the template and ensure consistent `ContractResult` usage in method signatures.
  - Updated `prd.agent.ts` to align with its contract (using `Promise<ContractResult<TOutput>>`) and the agent stub pattern. Resolved previous TypeScript errors.
  - Updated `scaffold.agent.ts` to align with its contract and the agent stub pattern.
  - Updated `analyzer.agent.ts` to align with its contract and the agent stub pattern.
  - Updated `quality.agent.ts` to align with its contract and the agent stub pattern.
  - Updated `pair.agent.ts` to align with its contract and the agent stub pattern.
  - Updated `prompt.agent.ts` to align with its contract and the agent stub pattern, including fixing `AgentError` structure.
  - Updated `api-reader.agent.ts` to align with its contract and the agent stub pattern.
  - Updated `refactor.agent.ts` to align with its contract and the agent stub pattern.
- Updated `docs/implementation-plan.md` to reflect progress and incorporate learnings about stub/contract alignment. All Phase 2 stubs (2.2 - 2.9) are now audited and aligned.
- Refined `docs/agents/agent-template.md` to include sections for 'Contract Version', 'Dependencies', and 'Key Decisions & Rationale', and to improve guidance on linking to contract files.
- Significantly enhanced `docs/seams/seam-template.md` with more detailed sections, clearer guidance on linking to `.contract.ts` files, explicit reference to `ContractResult` and `AgentError`, and a new 'Rationale for Seam' subsection.

### Fixed

- Corrected method signatures and return types in `RefactorAgent` and `ApiReaderAgent` to align with their respective contracts (from a previous session, now integrated into the broader QA pass).
- Ensured mock return data in `RefactorAgent` and `ApiReaderAgent` conforms to contract output types (from a previous session).
- Standardized import aliases for input/output types in `ApiReaderAgent` based on its contract (from a previous session).
- Resolved numerous TypeScript errors across multiple agent and contract files by ensuring strict adherence to contract definitions and consistent use of `ContractResult`.
- Corrected `prd.contract.ts` method signatures to use `Promise<ContractResult<TOutput>>` as per standard, resolving inconsistencies.
