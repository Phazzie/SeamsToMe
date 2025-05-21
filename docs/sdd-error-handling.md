# SDD Error Handling Strategies

This document provides detailed guidance and concrete examples for handling errors at seams in SDD-based systems. Effective error handling is critical for maintaining system robustness and graceful degradation.

## Core Principles for Seam Error Handling

### 1. Explicit Error Contracts

Every seam should explicitly define:

- The types of errors that can occur
- How errors are represented and communicated
- Error handling responsibilities for each side

### 2. Error Isolation

Errors should be contained at the seam level when possible to prevent cascading failures:

- Components should handle their internal errors
- The seam should handle communication/protocol errors
- Errors should not leak implementation details across seams

### 3. Predictable Error Patterns

Error handling should follow consistent patterns within a system:

- Use consistent error types and structures
- Document the severity and recoverability of each error
- Define standard retry and fallback behaviors

### 4. Graceful Degradation

Systems should degrade gracefully when components fail:

- Define fallback behaviors for critical operations
- Specify how partial results should be handled
- Implement circuit breaker patterns for persistent failures

## Error Handling Patterns for Seams

### 1. Error Types and Classification

Example contract with explicit error types:

```typescript
// Error classification in a contract
export enum ErrorSeverity {
  INFO, // Non-critical, operation succeeded with notes
  WARNING, // Concerning but operation succeeded
  ERROR, // Operation failed but system stable
  CRITICAL, // Operation failed, system stability affected
}

export enum ErrorSource {
  CLIENT, // Error from the calling component
  PROVIDER, // Error from the providing component
  NETWORK, // Communication error
  UNKNOWN, // Source cannot be determined
}

export interface SeamError {
  code: string; // Machine-readable error code
  message: string; // Human-readable message
  severity: ErrorSeverity;
  source: ErrorSource;
  retryable: boolean; // Can this operation be retried?
  correlationId?: string; // For tracing errors across seams
  details?: unknown; // Additional context-specific details
}

// Contract method with explicit error typing
async function processData(data: InputData): Promise<Result | SeamError>;
```

### 2. Retry Mechanisms with Idempotency

Example retry pattern at a seam:

```typescript
// Retry policy in a contract implementation
async function callProviderWithRetry(
  request: Request,
  maxRetries = 3,
  backoffMs = 200
): Promise<Response | SeamError> {
  let attempt = 0;

  while (attempt <= maxRetries) {
    try {
      // Note: The provider must implement this operation as idempotent
      const response = await provider.processRequest(request);
      return response;
    } catch (error) {
      const seamError = mapToSeamError(error);
      attempt++;

      // Only retry if the error is retryable
      if (!seamError.retryable || attempt > maxRetries) {
        return seamError;
      }

      // Exponential backoff
      await delay(backoffMs * Math.pow(2, attempt - 1));
    }
  }

  return {
    code: "RETRY_EXHAUSTED",
    message: `Failed after ${maxRetries} attempts`,
    severity: ErrorSeverity.ERROR,
    source: ErrorSource.NETWORK,
    retryable: false,
  };
}
```

### 3. Circuit Breaker Pattern

Example circuit breaker implementation:

```typescript
// Circuit breaker at a seam
class SeamCircuitBreaker {
  private failures = 0;
  private lastFailure: Date = new Date(0);
  private state: "CLOSED" | "OPEN" | "HALF_OPEN" = "CLOSED";

  constructor(
    private readonly failureThreshold = 5,
    private readonly resetTimeoutMs = 30000
  ) {}

  async executeCall<T>(fn: () => Promise<T>): Promise<T | SeamError> {
    if (this.state === "OPEN") {
      // Check if circuit should be half-open
      const now = new Date();
      if (now.getTime() - this.lastFailure.getTime() > this.resetTimeoutMs) {
        this.state = "HALF_OPEN";
      } else {
        return {
          code: "CIRCUIT_OPEN",
          message: "Service temporarily unavailable",
          severity: ErrorSeverity.ERROR,
          source: ErrorSource.PROVIDER,
          retryable: false,
        };
      }
    }

    try {
      const result = await fn();

      if (this.state === "HALF_OPEN") {
        this.state = "CLOSED";
        this.failures = 0;
      }

      return result;
    } catch (error) {
      this.lastFailure = new Date();
      this.failures++;

      if (
        this.state === "HALF_OPEN" ||
        this.failures >= this.failureThreshold
      ) {
        this.state = "OPEN";
      }

      return mapToSeamError(error);
    }
  }
}
```

### 4. Fallback Strategies

Example contract with defined fallbacks:

```typescript
// Fallback strategy in a contract
interface DataProviderContract {
  /**
   * Gets the latest data
   * @param key The data key
   * @param options Configuration options
   * @returns The requested data or a fallback if specified
   */
  getData(
    key: string,
    options: {
      timeout?: number;
      useCachedFallback?: boolean;
      defaultValue?: unknown;
    }
  ): Promise<DataResult | SeamError>;
}

// Implementation with fallback
async function getData(
  key: string,
  { timeout = 5000, useCachedFallback = true, defaultValue = null }
): Promise<DataResult | SeamError> {
  try {
    // Try to get fresh data with timeout
    const result = await Promise.race([
      fetchFreshData(key),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Timeout")), timeout)
      ),
    ]);

    return result as DataResult;
  } catch (error) {
    // Apply fallback strategy if fetching fails
    if (useCachedFallback) {
      const cachedData = cache.get(key);
      if (cachedData) {
        return {
          ...cachedData,
          fromCache: true,
          freshDataError: mapToSeamError(error),
        };
      }
    }

    // Last resort fallback
    if (defaultValue !== null) {
      return {
        data: defaultValue,
        isDefault: true,
        freshDataError: mapToSeamError(error),
      };
    }

    // No fallback available
    return mapToSeamError(error);
  }
}
```

### 5. Error Translation at Seams

Example error translation in glue code:

```typescript
// Error translation in glue code between systems
function translateError(
  upstreamError: UpstreamError,
  context: RequestContext
): SeamError {
  // Map error codes from upstream system to our contract's error codes
  const codeMap: Record<string, string> = {
    UPSTREAM_TIMEOUT: "PROVIDER_TIMEOUT",
    UPSTREAM_VALIDATION: "INVALID_INPUT",
    UPSTREAM_SERVER_ERROR: "PROVIDER_ERROR",
    // etc.
  };

  const seamCode = codeMap[upstreamError.code] || "UNKNOWN_ERROR";

  // Determine if this error is retryable
  const retryableCodes = ["PROVIDER_TIMEOUT", "RATE_LIMITED"];
  const isRetryable = retryableCodes.includes(seamCode);

  return {
    code: seamCode,
    message: upstreamError.userMessage || "An error occurred",
    severity: mapSeverity(upstreamError.level),
    source: ErrorSource.PROVIDER,
    retryable: isRetryable,
    correlationId: context.correlationId,
    details: {
      originalError: upstreamError.developerMessage,
      timestamp: new Date().toISOString(),
    },
  };
}
```

## Error Handling for AI-Generated Components

### 1. Validating AI Outputs at Seams

Example validation of AI-generated content:

```typescript
// Validating AI-generated content at a seam
async function processAIGenerated(
  aiResponse: unknown
): Promise<ValidatedContent | SeamError> {
  try {
    // Schema validation
    const validationResult = validateAgainstSchema(aiResponse, contentSchema);

    if (!validationResult.valid) {
      // AI generated invalid content
      return {
        code: "INVALID_AI_OUTPUT",
        message: "The AI generated content that does not meet the contract",
        severity: ErrorSeverity.ERROR,
        source: ErrorSource.PROVIDER,
        retryable: true,
        details: validationResult.errors,
      };
    }

    // Content safety checks
    const safetyResult = await checkContentSafety(aiResponse);

    if (!safetyResult.safe) {
      // AI generated unsafe content
      return {
        code: "UNSAFE_AI_OUTPUT",
        message: "The AI generated content that did not pass safety checks",
        severity: ErrorSeverity.ERROR,
        source: ErrorSource.PROVIDER,
        retryable: true,
        details: safetyResult.issues,
      };
    }

    // Additional validation logic
    const businessRulesResult = checkBusinessRules(aiResponse);

    if (!businessRulesResult.valid) {
      // AI generated technically valid but logically problematic content
      return {
        code: "BUSINESS_RULE_VIOLATION",
        message: "The AI output violates business rules",
        severity: ErrorSeverity.WARNING,
        source: ErrorSource.PROVIDER,
        retryable: true,
        details: businessRulesResult.violations,
      };
    }

    // All validation passed
    return {
      ...(aiResponse as ValidatedContent),
      validated: true,
      validationTimestamp: new Date().toISOString(),
    };
  } catch (error) {
    return mapToSeamError(error);
  }
}
```

### 2. Human-in-the-Loop Error Handling

Example of human intervention for critical errors:

```typescript
// Human-in-the-loop error handling
async function processWithHumanFallback<T>(
  operation: () => Promise<T>,
  context: {
    importance: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
    description: string;
    data: unknown;
  }
): Promise<T | SeamError> {
  try {
    return await operation();
  } catch (error) {
    const seamError = mapToSeamError(error);

    // For critical operations, engage human
    if (context.importance === "CRITICAL" || context.importance === "HIGH") {
      const humanTaskId = await humanInterventionQueue.add({
        error: seamError,
        context,
        timestamp: new Date().toISOString(),
      });

      return {
        ...seamError,
        code: "HUMAN_INTERVENTION_REQUESTED",
        message: "A human will review this error",
        humanTaskId,
        retryable: false,
      };
    }

    return seamError;
  }
}
```

## Testing Error Handling at Seams

### 1. Contract Conformance for Errors

Example test for error contract conformance:

```typescript
// Testing error contract conformance
describe("Data Provider Error Contract", () => {
  test("returns correctly formatted SeamError on timeout", async () => {
    // Arrange
    const mockProvider = createMockProvider({
      simulateTimeout: true,
    });

    // Act
    const result = await mockProvider.getData("test-key", { timeout: 100 });

    // Assert
    expect(result).toHaveProperty("code", "PROVIDER_TIMEOUT");
    expect(result).toHaveProperty("severity", ErrorSeverity.ERROR);
    expect(result).toHaveProperty("retryable", true);
    expect(result).toHaveProperty("source", ErrorSource.PROVIDER);
    expect(result).toHaveProperty("message"); // Should have a message
  });

  test("uses fallback when specified and primary fails", async () => {
    // Arrange
    const mockProvider = createMockProvider({
      simulateError: true,
      mockCache: { "test-key": { data: "cached-value" } },
    });

    // Act
    const result = await mockProvider.getData("test-key", {
      useCachedFallback: true,
    });

    // Assert
    expect(result).toHaveProperty("data", "cached-value");
    expect(result).toHaveProperty("fromCache", true);
    expect(result).toHaveProperty("freshDataError.code");
  });
});
```

### 2. Chaos Testing for Seams

Example of intentionally injecting errors to test handling:

```typescript
// Chaos testing for seams
describe("Orchestrator-Changelog Seam Resilience", () => {
  test("orchestrator continues functioning when changelog is down", async () => {
    // Arrange
    const chaosProvider = {
      changelog: createChaosProvider("changelog", {
        failureRate: 1.0, // 100% failure
        failureMode: "CONNECTION_ERROR",
      }),
      documentation: createStandardProvider("documentation"),
      checklist: createStandardProvider("checklist"),
    };

    const orchestrator = new OrchestratorAgent(chaosProvider);

    // Act
    const result = await orchestrator.processWorkflow({
      name: "feature-addition",
      steps: ["documentation", "checklist", "changelog"],
    });

    // Assert
    expect(result.status).toBe("PARTIAL_SUCCESS");
    expect(result.completedSteps).toContain("documentation");
    expect(result.completedSteps).toContain("checklist");
    expect(result.failedSteps).toContain("changelog");
    expect(result.errors.changelog).toHaveProperty("code", "CONNECTION_ERROR");
  });
});
```

## Best Practices & Guidelines

1. **Document Error Scenarios**: Include error cases in seam documentation.
2. **Error Observability**: Log and monitor errors at seam boundaries.
3. **Error Correlation**: Use correlation IDs to track errors across seams.
4. **Graceful Degradation by Design**: Plan fallback behaviors upfront.
5. **Consistent Error Structures**: Standardize error formats across all seams.
6. **No Silent Failures**: All errors should be visible and trackable.
7. **Test Error Paths**: Include error scenarios in seam tests.
8. **Evolve Error Contracts**: Update error types as new scenarios emerge.

---

This document is a living artifact. Update it as our understanding of error handling in SDD evolves.
