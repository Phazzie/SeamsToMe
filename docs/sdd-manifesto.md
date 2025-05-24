# Seam-Driven Development (SDD) Manifesto

## Purpose

This document is the definitive guide to Seam-Driven Development (SDD), a contract-first, integration-first methodology for building robust, maintainable, and AI-friendly software systems. It is intended as both a practical manual and a philosophical foundation for all SDD projects. **Core SDD terms are defined throughout this document. Individual projects applying SDD should maintain their own glossaries for any project-specific terminology or specialized component types, a practice SDD recommends (see Human-AI Collaboration).**

---

## 1. SDD Core Principles

- **Contract-First:** Explicitly define all interfaces ("seams") and data contracts **with precise signatures (including case sensitivity and exact method/parameter matching)** before building internal logic.
- **Stub Everything Early:** Create skeletal implementations (stubs) for all seams, with top-level blueprint comments explaining purpose, data flow, and integration points.
- **Blueprint Comments:** Comments in contract/stub files act as architectural blueprints. **They must consistently capture key metadata such as the `Contract` being implemented/defined, its `Purpose`, expected `Dataflow` (including key inputs/outputs and their transformations), `Integrations` with other specific seams/components, potential `Failure Modes` (and how they might be handled or propagated), and the `Rationale` behind design choices (especially non-obvious ones).** These describe the "why" and "how" of each seam.
  - **Insightful vs. Superficial Blueprint Example:**
    - _Superficial:_ `// SDD-Blueprint: Processes data.`
    - _Insightful:_ `// SDD-Blueprint: Purpose - Validates raw user input against schema X, enriches with data from UserProfileServiceContract, then transforms into ProcessedDataFormat for downstream consumption by ReportingServiceContract. Dataflow - Input: RawUserInput -> Output: ContractResult<ProcessedDataFormat>. Integrations - UserProfileServiceContract.getProfile(), ReportingServiceContract.submitData(). Failure Modes - Returns validation error if input malformed; returns service unavailable error if UserProfileService is down. Rationale - Enrichment is done here to centralize user data augmentation logic.`
- **Testable Seams:** Seams and stubs must be testable and verified before deeper implementation begins.
- **AI-First Enablement:** SDD is designed to play to AI's strengths (clear specs, isolated tasks) and avoid its weaknesses (integration ambiguity, the "70% wall").
- **Non-Negotiable Foundation: Halt on Missing Contract.** No implementation proceeds until its seams (`CONTRACT`s) are defined, `STUB`s for these **components** are created with comprehensive blueprint comments, and initial `SEAM TEST`s are in place and passing against the stubs.

---

## 2. SDD Process Overview

The SDD process follows a strict pipeline to ensure foundational stability:

1.  **Define `CONTRACT`:** Identify and meticulously define the interface specification (methods, data structures, types). This is the seam.
2.  **Implement `STUB`:** Create a minimal, non-functional implementation of the contract that typically raises `NotImplementedError` or returns placeholder data. Include comprehensive blueprint comments.
3.  **Write `SEAM TEST`:** Develop tests that verify the stub's adherence to the contract and the correct behavior of the seam from a consumer's perspective. These tests run against the stub initially.
4.  **Implement Logic:** With the contract, stub, and seam tests in place and validated, implement the actual business logic within the **component**. The seam tests are then run against the real implementation.
5.  **Guard the Seams:** Continuously monitor, test, and review seams to ensure they remain correct and unbroken as the system evolves.

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
- **Common Versioning Strategies:**
  - **V-Numbering:** Create entirely new contract files (e.g., `MyServiceContractV1.ts`, `MyServiceContractV2.ts`) for breaking changes. This is clear but requires consumers to update explicitly.
  - **Optional Parameters & Fields:** For non-breaking additions, add new optional parameters to methods or optional fields to data structures. Clearly document which version of a component introduces/consumes these. Deprecate and eventually remove old signatures/fields over time.
- **Adapter Pattern:** When introducing a breaking change (e.g., `ContractV2` from `ContractV1`), an Adapter component can be temporarily introduced. This adapter implements `ContractV1` but internally calls `ContractV2`, allowing consumers to migrate at their own pace.

### Testing Philosophy

- Write contract conformance and behavioral tests before or alongside glue code.
- Use property-based and unit tests as needed.
- Integration tests should mock internals but use real contracts and glue.
- **Test stub implementations early to confirm contract adherence and that unimplemented methods correctly signal their state (e.g., via a standardized `NotImplementedError` that includes diagnostic details like component and method identifiers). This establishes the testing framework from the outset and validates contract usability from a consumer's perspective.**
- **Utilize Static Analysis: Ensure code passes linters and type-checkers as an integral part of the development and testing cycle to catch errors early and maintain code quality at the seams.**

### Human-AI Collaboration

- Humans define and approve intent; AI drafts contracts, stubs, and tests for **components**.
- Shared contract repository is the single source of truth.
- An **orchestration mechanism or designated lead** manages workflow and review.
- **Effective AI collaboration relies on treating instructions as a form of contract with the AI. This includes:**
  - **Providing a clear mission, a glossary of project-specific terms (including specific component roles or types), and defined sequential processes for development tasks.**
  - **Mandating standardized "blueprint comments" in generated stubs and files to capture design rationale, data flow, integration points, and failure modes.**
  - **Establishing a clear "Definition of Done" (DoD) for AI-assisted tasks, typically including the creation and verification of contracts, stubs, seam tests, updated blueprint comments, and passing static analysis checks.**
  - **Using protocols for the AI to acknowledge and confirm its understanding of complex instructions, ensuring alignment before generation.**

### Seam Discovery

- Use event storming, responsibility-driven analysis, and “what if this changes?” prompts to uncover hidden seams.
- Trace data lifecycles and handoffs for seam identification.

### Seam Documentation

- The contract file IS the documentation: include purpose, participants, data flow, behaviors, error handling, version, and rationale.
- Use visualizations (e.g., Mermaid graphs) for architecture clarity.

### Seam Ownership

- The **component provider** stewards the contract; consumers co-design and must agree.
- A **contract management system or designated role** manages registry and versioning; an **orchestration mechanism** oversees usage.
- Notify all consumers of changes; track with evolution tracker.

### Seam Failure Modes & Prevention

- Data mismatches, behavioral misunderstandings, error handling incompatibility, version drift, and breaking changes are common failures.
- SDD prevents these with hyper-specific contracts, **standardized error reporting (e.g., using a `ContractResult` wrapper)**, integration tests, versioning, and documentation.
- **Implement Fail-Fast Boundaries: Validate inputs strictly at all seam boundaries (function arguments, API responses, inter-component messages). Wrap external errors in domain-specific exceptions immediately at the seam to provide clear, actionable error information.**

### Seam Visualization

- Use automated, interactive, color-coded graphs to show seam status and relationships.
- Allow drill-down for contract details and test status.

### SDD Beyond Code

- Apply SDD to workflows, documentation, and team responsibilities.
- Define and test handoffs, cross-references, and deliverables as seams/contracts.

**### Standardized Patterns for Consistency**

**To ensure consistency, predictability, and maintainability across seams and component implementations, SDD advocates for:**

- **`ContractResult` Wrapper:** All asynchronous **component** operations that can succeed or fail must return a standardized wrapper (e.g., `Promise<ContractResult<TOutput>>`). This provides a consistent pattern for returning either the successful data payload (`TOutput`) or structured error information. Structured errors should include an error category, a descriptive message, and optional details to aid in debugging.
- **Component Stub Implementation Pattern:** Follow a consistent, documented pattern for all **component** stubs. Key elements include:
  - Exact signature matching with the corresponding contract.
  - Comprehensive "blueprint comments" at the top of the file and for each method, detailing purpose, data flow, integration points, and potential failure modes.
  - Initial mock implementations that correctly use the `ContractResult` wrapper, returning, for example, `success(mockData)` for successful outcomes or `failure(createNotImplementedError(...))` for methods not yet implemented. **Ensure such placeholder errors (like `NotImplementedError`) are designed to carry rich diagnostic information (e.g., component name, method name) to aid debugging during early integration.**
  - Clear `SDD-TODO` markers to indicate where actual business logic needs to be filled in.
- **Strict Type Alias Usage:** When contracts define input/output type aliases (e.g., `<AgentName>Input`, `<AgentName>Output`), these aliases should be consistently used in the agent's implementation and tests to maintain clarity and alignment with the contract.

---

## 4. SDD Anti-Patterns to Avoid

- Implicit contracts (undocumented interfaces)
- Tight coupling between **component** internals
- "God **Component**" syndrome (one **component** does too much)
- Untracked state/side effects
- Integration as an afterthought
- Skipping stub/test phases
- Poor error handling
- Version drift without communication
- **Components violating single responsibility (leading to overly complex or leaky seams)**
- **Hidden dependencies or global state bypassing seams (instead of explicit dependency injection for all external needs)**

---

## 5. Illustrative Example: Applying SDD to a Feature

This section provides a conceptual example of how SDD principles might be applied when developing a new feature or system, without tying it to a specific project's architecture.

- **Identify Key Interaction Points (Seams):** For a feature involving user interaction leading to data processing and then notification, potential seams could be:
  - `UserInterfaceContract`: Defines how the user submits requests and receives feedback.
  - `DataProcessingServiceContract`: Defines how input data is processed and results are generated.
  - `NotificationServiceContract`: Defines how users or other systems are notified of outcomes.
- **Define `CONTRACT`s:** For each seam, specify method signatures, request/response data structures, and error types.

  - Example for `DataProcessingServiceContract`:

    ```typescript
    // Hypothetical contract snippet
    // (Assumes ContractResult, success, failure, and a standard error type like AppError are defined elsewhere)

    interface ProcessDataRequest {
      input: string;
      // other relevant request fields
    }

    interface ProcessDataPayload {
      // Renamed from ProcessDataResponse to be the 'TOutput' in ContractResult<TOutput>
      output: string;
      // other relevant response fields
    }

    interface IDataProcessingService {
      process(
        request: ProcessDataRequest
      ): Promise<ContractResult<ProcessDataPayload>>; // Explicitly uses ContractResult
    }
    ```

- **Implement `STUB`s:** Create minimal implementations for each contract.

  - Example for `DataProcessingServiceContract` stub:

    ```typescript
    // Hypothetical stub snippet
    class DataProcessingServiceStub implements IDataProcessingService {
      async process(
        request: ProcessDataRequest
      ): Promise<ContractResult<ProcessDataPayload>> {
        // SDD-Blueprint: (Simplified for this example) Validates input, processes data, returns result or error.
        // A real blueprint comment here would be more detailed, covering Purpose, Dataflow, Integrations, etc., as per Section 1.
        // SDD-TODO: Implement actual data processing logic.
        console.log(`Stub: Processing data for input: ${request.input}`);

        // Example of successful response using the ContractResult pattern
        if (request.input === "valid_input") {
          return success({ output: "mocked_processed_output_for_valid_input" });
        }

        // Example of a business logic error using the ContractResult pattern
        if (request.input === "known_error_condition") {
          return failure({
            category: "BusinessRuleViolation",
            message: "Input triggered a known error condition.",
            details: { originalInput: request.input },
          });
        }

        // Default placeholder for not yet implemented paths, using a specific error
        return failure(
          createNotImplementedError(
            "DataProcessingServiceStub.process - specific path not handled"
          )
        );
      }
    }
    ```

- **Write `SEAM TEST`s:** Test each stub's adherence to its contract. For instance, test that `DataProcessingServiceStub.process` can be called with a valid `ProcessDataRequest`.
  - **Crucially, these tests would verify that the returned `Promise` resolves to a `ContractResult<ProcessDataPayload>` structure.** This means checking for the presence of `data` and `error` properties, and that `data` (on success) matches the `ProcessDataPayload` interface, or that `error` (on failure) conforms to the expected error structure.
  - Tests would cover scenarios like:
    - Successful processing (returns `success(payload)`).
    - Expected business errors (returns `failure(appError)`).
    - Calls to unimplemented parts of the stub (returns `failure(notImplementedError)`).
- **Implement `Logic`:** Develop the actual internal logic for the UI handling, data processing, and notification services.
- **Versioning:** If the `DataProcessingServiceContract` needs a breaking change later (e.g., new required parameter), create `DataProcessingServiceContractV2`, update stubs and tests accordingly, and manage the transition for consumers.
- **Visualization (Conceptual):** Imagine a diagram showing these components (`UserInterface`, `DataProcessingService`, `NotificationService`) and the contracts that define their interactions.

This generalized example illustrates the SDD workflow. The specific nature of the components and contracts will vary widely depending on the system being built.

---

## 6. SDD Manifesto

- We believe that robust, maintainable, and AI-friendly systems are built on explicit, testable, and well-documented seams.
- We commit to the **sequential SDD pipeline: meticulously defining `CONTRACT`s, implementing `STUB`s with comprehensive blueprint comments, writing `SEAM TEST`s that validate these stubs against their contracts, and only then developing the internal `Logic` of components.**
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

- **Clear Boundaries:** Contracts **and detailed blueprint comments derived from well-structured AI instructions** create explicit guardrails for AI to work within, preventing architectural drift.
- **Focused Generation:** AI can concentrate on implementing one contract at a time without requiring full system context.
- **Validation Points:** Seam tests provide immediate feedback on contract conformance.
- **Integration First:** By defining and testing integrations before implementation, we avoid the most common AI pitfall.
- **Structured Prompts:** Clearly defined contracts, stub patterns, and blueprint comment requirements naturally translate into well-defined, focused prompts for AI. This improves the quality, relevance, and adherence of AI-generated code to the intended design.

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

SDD, especially for those newer to systematic software design or AI-assisted development, champions a "Simplicity First" mindset:

- **Start with Minimal Viable Contracts:** Define the absolute simplest version of a contract that can provide a piece of functionality or define an interaction. Avoid adding all conceivable features or parameters at the outset.
- **Clarity Over Premature Complexity:** Prioritize clear, unambiguous language and straightforward structures in your initial contract definitions and blueprint comments. If a concept is hard to explain simply, the contract might be too complex for an initial iteration.
- **Iterate and Elaborate:** Once the basic seam is established and tested with a simple contract, it can be evolved. Add complexity, new parameters, or richer data types incrementally as the system's needs become clearer and the developer's understanding deepens.
- **Focus on the Core Loop:** For novices, mastering the fundamental SDD flow (Define `CONTRACT` -> Implement `STUB` -> Write `SEAM TEST` -> Implement `Logic`) with simple examples is paramount. Advanced patterns and complex orchestrations can come later.
- **Concrete Examples Over Abstract Designs:** When learning, working through tangible, small-scale examples of SDD application is more effective than trying to absorb abstract architectural theories. SDD's structure lends itself to this by breaking problems down.
- **Reduce Cognitive Load:** The goal is to make the initial steps into structured development less daunting. Simple, well-defined seams reduce the number of concepts a developer has to juggle simultaneously.

This approach ensures that developers can build confidence and understanding progressively, leveraging SDD as a scaffold for learning and growth rather than an overwhelming set of rules.

---

This document is a living artifact. Update it as SDD evolves and as SeemsToMe grows.
