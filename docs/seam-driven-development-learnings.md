# Seam-Driven Development: Learnings & Discoveries

This document captures key learnings, insights, addendums, and discoveries made during the implementation of the "SeemsToMe" project using seam-driven development. As this is a novel application of the methodology, these notes are intended to help refine the process and document its practical application.

## Initial Learnings (May 2025)

### 1. Contract Adherence is Case-Sensitive and Exact

**Discovery Date:** 2025-05-18

**Context:**
A TypeScript error (`ts2420`) occurred in `prd.agent.ts`: "Class 'PrdAgent' incorrectly implements interface 'PRDAgentContract'. Property 'generatePRD' is missing...".

**Finding:**
The `PrdAgent` class implemented a method named `generatePrd` (lowercase 'prd'), while the `PRDAgentContract` (aliased by `IPrdAgent`) defined the method as `generatePRD` (uppercase 'PRD').

**Learning:**
Interfaces (contracts) in TypeScript are strict and case-sensitive. The implementing class must match the contract's method signatures _exactly_, including the casing of method names, parameter names (if the contract specifies them strictly, though often type compatibility is key), and return types.

**Implication for seam-driven development:**

- When defining contracts, be explicit and consistent with naming conventions.
- When implementing agents based on contracts, meticulous attention to detail is required to match the contract precisely.
- Tooling (like the TypeScript compiler) is a critical first line of defense in ensuring contract adherence. SDD makes these mismatches surface clearly at the boundaries.
- This reinforces the "Contracts are Truth" principle of seam-driven development. Any deviation, even minor like casing, is a contract violation.

---

### 2. Guidelines for Preventing Contract Discrepancies

**Discovery Date:** 2025-05-18 (consolidated from ongoing observations)

**Context:**
During the initial creation and refinement of agent contracts and stubs, several discrepancies were identified and corrected. These often involved mismatches in method signatures, type alias usage, and mock data structures.

**Learnings & Recommended Practices:**

- **Strict Contract Adherence:** Agent method signatures (name, parameters, return type) in the `*.agent.ts` files must _exactly_ match the definitions in the corresponding `*.contract.ts` file. This precision includes:

  - **Case Sensitivity:** Method names and parameter names must match case.
  - **Parameter Order and Types:** The order and types of parameters must align.
  - **Return Types:** The return type, including generic wrappers like `Promise`, must be identical.
  - **`ContractResult` Wrapper:** All asynchronous agent operations that might produce an error (which is most of them) must return `Promise<ContractResult<TOutput>>`, where `TOutput` is the specific success payload type for that method. This ensures a consistent error handling pattern across all agents.

- **Type Alias Consistency:**

  - When defining type aliases in contract files (e.g., `export type RefactorInput = RefactorRequest;`, `export type RefactorOutput = RefactorResult;`), these aliases (`RefactorInput`, `RefactorOutput`) should be consistently used in the agent stub's import statements and method signatures.
  - The established pattern is:
    - `export type <AgentName>Input = <AgentName>Request;`
    - `export type <AgentName>Output = <AgentName>Result;` (or a more specific interface like `RefactorPlan`, `ApiDocSummary` if the result isn't just a simple success/error).
  - Agent stubs should then import and use `<AgentName>Input` and `<AgentName>Output`.

- **Mock Data Conformance:**

  - When implementing mock return values in agent stubs (e.g., for `generatePRD` in `prd.agent.ts`), the structure of the mock data object _must_ conform to the `Output` type defined in the contract (which is typically an alias to a more specific result interface like `PRDGenerationResult`, `StubGenerationResult`, etc.).
  - This means ensuring all required fields are present and have the correct types, and that the overall structure matches the interface. If the method returns `ContractResult<TOutput>`, the mock should be `{ result: yourMockOutputData }` or `{ error: yourMockErrorData }`.

- **Regular Contract Review:**

  - Before starting the implementation or making significant changes to an agent, developers _must_ re-verify the corresponding `*.contract.ts` file. This ensures their understanding of the method signatures, input/output types, and any recent contract modifications is up-to-date.
  - Treat the contract file as the single source of truth for an agent's interface.

- **Leverage the TypeScript Compiler:**
  - Encourage developers to frequently run `tsc` (the TypeScript compiler) or rely heavily on the real-time TypeScript checking provided by their IDE (like VS Code) throughout the development process.
  - The TypeScript compiler is the most effective first line of defense in catching contract mismatches, type errors, and other inconsistencies _before_ they become harder-to-debug runtime issues. Address compiler errors promptly.

**Implication for seam-driven development:**
These practices reinforce the core SDD principle of "Explicit Interfaces." By being meticulous about contract definition and adherence, the "seams" between components become more robust and reliable, reducing integration friction and making the system easier to understand, test, and maintain.

---

### 3. Agent Stub Implementation Pattern

**Discovery Date:** 2025-05-19

**Context:**
To ensure consistency and maintainability across all agent stubs, a standardized pattern was defined based on a review of existing agents (`prd.agent.ts`, `checklist.agent.ts`) and best practices identified during the contract audit phase.

**Defined Pattern:**

1.  **File Header & Comments:**

    - `// filepath: {absolute path to the .agent.ts file}`
    - Brief description of the agent's purpose.
    - `// SDD-TODO: This is a stub implementation. Replace with actual logic.`

2.  **Imports:**

    - Import the corresponding contract interface (e.g., `import { IPrdAgent, PrdInput, PrdOutput } from '../contracts/prd.contract';`).
    - Import shared types like `AgentId`, `ContractResult`, `AgentError` from `../contracts/types`.
    - Import any other necessary types or utilities.

3.  **Class Definition:**

    - `export class <AgentName>Agent implements <ContractInterfaceName> {`
    - Example: `export class PrdAgent implements IPrdAgent {`

4.  **Constructor (Optional but Recommended for Consistency):**

    - Even if not immediately used, include a basic constructor for future dependency injection or initialization.
    - `constructor() { /* SDD-TODO: Initialize any dependencies here */ }`

5.  **Method Stubs:**

    - **Signature Matching:** Each method signature _must exactly_ match the contract definition (name, parameters, return type `Promise<ContractResult<OutputAlias>>`).
      - Example: `async generatePRD(request: PrdInput): Promise<ContractResult<PrdOutput>> {`
    - **Blueprint Comment:** Include a blueprint comment explaining the method's intended purpose, inputs, outputs, and any high-level logic flow.
      - `// SDD-Blueprint: ...`
    - **`requestingAgentId` Handling (if applicable):** If the contract's request object includes `requestingAgentId`, acknowledge its presence or intended use in comments if not immediately used in the stub.
    - **Mock Success Implementation:**
      - Return a `Promise.resolve` with a `result` object.
      - The `result` object's structure _must_ conform to the `OutputAlias` type from the contract.
      - Include placeholder or minimal valid mock data.
      - Example:
        ```typescript
        return Promise.resolve({
          result: {
            prdId: "prd-123",
            content: "Mock PRD content.",
            status: "success",
          },
        });
        ```
    - **Mock Error Implementation (Illustrative, commented out or conditional):**
      - Show how a `ContractResult` error would be returned.
      - Example (commented out):
        ```typescript
        /* Mock error example:
        return Promise.resolve({
            error: {
                message: 'Failed to generate PRD due to a mock error.',
                code: 'MOCK_PRD_ERROR',
                details: 'Additional error details here...'
            }
        });
        */
        ```
    - **`SDD-TODO` for Logic:** Include a clear `// SDD-TODO: Implement actual business logic here.` comment within the method body.

6.  **Mock Data Conformance:**
    - The structure of any mock data returned (e.g., in the `result` field of `ContractResult`) must strictly adhere to the type definition specified in the contract's `OutputAlias` (e.g., `PrdOutput`, `ScaffoldOutput`).

**Implication for seam-driven development:**
This standardized stub pattern promotes consistency, makes stubs easier to understand and review, and ensures that the initial integration points (the stubs) correctly reflect the contract. It also provides clear placeholders (`SDD-TODO`, blueprint comments) for subsequent development phases.

---

### 4. Strategies for Preventing Common Mistakes (Post-Stub-Audit Learnings)

**Discovery Date:** 2025-05-19

**Context:**
After completing the initial contract and stub creation, and during the subsequent QA audit of stubs, several recurring issues were noted, primarily around contract-stub alignment and consistent use of `ContractResult`.

**Learnings & Prevention Strategies:**

1.  **Proactive Guideline Review:**

    - **Action:** Before starting any major phase (e.g., "Create All Contracts," "Create Minimal Stubs," "Write Contract Tests"), explicitly re-read and discuss the relevant guidelines documented in `docs/implementation-plan.md` and this `seam-driven-development-learnings.md` file.
    - **Rationale:** Reinforces established patterns and requirements before work begins, reducing the chance of oversight.

2.  **Systematic Pattern Application:**

    - **Action:** When a template (e.g., `src/contracts/contract-template.ts`) or a detailed pattern (e.g., "Agent Stub Implementation Pattern") is defined, use it as a checklist when creating each new file or component.
    - **Rationale:** Ensures all elements of the established best practice are considered and implemented, improving consistency.

3.  **Immediate Post-Creation Validation & Cross-Referencing:**

    - **Action:** Immediately after creating/modifying a contract AND its corresponding stub (or vice-versa):
      - Run a type check (e.g., `tsc --noEmit` or rely on IDE errors for the specific files).
      - Manually cross-reference method signatures, type names (including aliases), and import statements between the `.contract.ts` and `.agent.ts` files.
    - **Rationale:** Catches discrepancies at the earliest possible moment, when the context is fresh and fixes are simpler. This is more effective than batch-checking later.

4.  **Incremental Commits & Checks:**

    - **Action:** Commit changes more frequently, especially after completing a contract-stub pair or a small group of related files. Run checks before each commit.
    - **Rationale:** Isolates errors to smaller change sets, making them easier to identify and fix.

5.  **Focus on `ContractResult` Usage:**

    - **Action:** Pay special attention to the guideline: "All asynchronous agent methods that can fail _must_ return `Promise<ContractResult<TOutput>>`." Verify this for every method in every contract and its corresponding stub implementation.
    - **Rationale:** This is a core pattern for consistent error handling and data return, and was a frequent point of misalignment.

6.  **Continuous Learning Documentation:**
    - **Action:** Continue to diligently document any new insights, common pitfalls, or refined best practices in this `seam-driven-development-learnings.md` document.
    - **Rationale:** Builds a project-specific knowledge base that helps the team (and future developers) avoid repeating past mistakes.

**Implication for seam-driven development:**
By adopting these more disciplined, proactive checks and balances, the SDD process can be made smoother. The goal is to leverage the explicitness of seams and contracts to catch errors at the boundaries as early and efficiently as possible, rather than discovering them later during more complex integration phases.

---

### 5. Contract Testing for Stub Implementations

**Discovery Date:** 2025-05-19

**Context:**
During the creation of contract tests for the `RefactorAgentContract` (in `refactor.contract.test.ts`), the corresponding `RefactorAgent` methods were still stubs, designed to throw `NotImplementedError`.

**Finding:**
It is beneficial to write contract tests even when the agent's methods are just stubs. These tests can:

1.  Verify that the test setup correctly invokes the agent methods as defined in the contract.
2.  Confirm that stubbed methods correctly throw `NotImplementedError`.
3.  Ensure that the `NotImplementedError` includes essential diagnostic information, such as `agentId`, `requestingAgentId`, and `methodName`, which aids in debugging and tracking unimplemented features.
4.  Validate the contract from a consumer's perspective (the test itself acts as a consumer).
5.  Allow for the definition of test cases for expected inputs and error conditions (e.g., missing required parameters), even if the immediate expectation is a `NotImplementedError`.

**Learning:**
Creating contract tests for stub implementations is a valuable early step. It establishes the testing framework for the agent, validates the contract's usability, and ensures that the "not implemented" state is handled consistently and informatively. This practice aligns well with a test-driven approach to developing agent functionalities. It also means that as soon as the actual logic replaces the stub, the tests are already in place to verify the implementation against the contract.

**Implication for seam-driven development:**
This approach reinforces the "Testable Seams" aspect of SDD. By testing against the contract from the outset, even with stubs, we ensure that the seam (the contract) is well-defined and that the eventual implementation will be guided by testable requirements. It also helps in incrementally building and validating the system.

---

### 6. Importance of Granular Logging in Agent Operations

**Discovery Date:** 2025-05-21

**Context:**
While enhancing the `MVPSddScaffolderAgent` to include an overwrite policy, it became clear that detailed logging of its internal operations would be crucial for debugging and understanding its behavior, especially with different policies in effect.

**Learning:**
For complex agent operations, especially those involving file system interactions or multiple internal steps (like the scaffolder processing different component types or policies):

- **Step-by-Step Logging:** Implementing `console.info` (or a more sophisticated logging framework) at each significant step of the agent's process provides invaluable insight into its execution flow.
- **Policy/Parameter Logging:** Logging the input parameters and any policies (like `OverwritePolicy`) that affect behavior helps in quickly diagnosing issues related to specific configurations.
- **Clear Error Logging:** `console.error` should be used for actual errors, providing context about where the error occurred and why (e.g., file already exists with `ERROR_IF_EXISTS` policy).
- **Success Confirmation:** Logging successful operations (e.g., file created, file overwritten, file skipped) confirms that the agent is behaving as expected under different conditions.
- **Agent ID Prefix:** Prefixing log messages with a unique agent identifier (e.g., `[MVPSddScaffolderAgent_v1]`) is helpful when multiple agents might be logging concurrently or when analyzing aggregated logs.

**Implication for seam-driven development:**
While SDD focuses on contracts and external behavior, robust internal logging within an agent is a key aspect of its implementability and maintainability. Good logging makes the "black box" of an agent more transparent during development and troubleshooting, complementing the clarity provided by well-defined seams.

_(More learnings to be added as the project progresses)_
