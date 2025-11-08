import { BaseAgent } from "../agents/base.agent";
import { AgentId, ErrorCategory, ContractResult } from "../contracts/types";
import { success, failure } from "../contracts/types";

// Create a concrete test agent since BaseAgent is abstract
class TestAgent extends BaseAgent {
  protected readonly agentId: AgentId = "test-agent" as AgentId;

  // Expose protected methods for testing
  public testValidateRequired<T>(value: T | null | undefined, fieldName: string): value is T {
    return this.validateRequired(value, fieldName);
  }

  public testValidateNonEmpty(value: string | null | undefined, fieldName: string): value is string {
    return this.validateNonEmpty(value, fieldName);
  }

  public testValidateNonEmptyArray<T>(value: T[] | undefined | null, fieldName: string): value is T[] {
    return this.validateNonEmptyArray(value, fieldName);
  }

  public testValidateFields(
    fields: Record<string, { value: unknown; type: "required" | "nonEmpty" | "nonEmptyArray" }>,
    requestingAgentId?: AgentId
  ): ContractResult<void> {
    return this.validateFields(fields, requestingAgentId);
  }

  public testWithErrorHandling<R>(
    fn: () => Promise<ContractResult<R>>,
    operation: string
  ): Promise<ContractResult<R>> {
    return this.withErrorHandling(fn, operation);
  }

  public testCreateError(message: string, category: ErrorCategory, name?: string) {
    return this.createError(message, category, name);
  }

  public testCreateValidationError(field: string, message?: string) {
    return this.createValidationError(field, message);
  }

  public testCreateOperationError(operation: string, error: unknown) {
    return this.createOperationError(operation, error);
  }

  public testCreateNotImplementedError(methodName: string) {
    return this.createNotImplementedError(methodName);
  }
}

describe("BaseAgent", () => {
  let agent: TestAgent;

  beforeEach(() => {
    agent = new TestAgent();
  });

  describe("validateRequired", () => {
    test("should return true for defined values", () => {
      expect(agent.testValidateRequired("value", "field")).toBe(true);
      expect(agent.testValidateRequired(0, "field")).toBe(true);
      expect(agent.testValidateRequired(false, "field")).toBe(true);
      expect(agent.testValidateRequired("", "field")).toBe(true); // Empty string is defined
    });

    test("should return false for null", () => {
      expect(agent.testValidateRequired(null, "field")).toBe(false);
    });

    test("should return false for undefined", () => {
      expect(agent.testValidateRequired(undefined, "field")).toBe(false);
    });

    test("should work as type guard", () => {
      const value: string | null = "test";
      if (agent.testValidateRequired(value, "field")) {
        // TypeScript should know value is string here
        expect(value.toUpperCase()).toBe("TEST");
      }
    });
  });

  describe("validateNonEmpty", () => {
    test("should return true for non-empty strings", () => {
      expect(agent.testValidateNonEmpty("value", "field")).toBe(true);
      expect(agent.testValidateNonEmpty("  value  ", "field")).toBe(true);
    });

    test("should return false for empty strings", () => {
      expect(agent.testValidateNonEmpty("", "field")).toBe(false);
      expect(agent.testValidateNonEmpty("   ", "field")).toBe(false);
    });

    test("should return false for null/undefined", () => {
      expect(agent.testValidateNonEmpty(null, "field")).toBe(false);
      expect(agent.testValidateNonEmpty(undefined, "field")).toBe(false);
    });

    test("should work as type guard", () => {
      const value: string | null = "test";
      if (agent.testValidateNonEmpty(value, "field")) {
        // TypeScript should know value is string here
        expect(value.length).toBe(4);
      }
    });
  });

  describe("validateNonEmptyArray", () => {
    test("should return true for non-empty arrays", () => {
      expect(agent.testValidateNonEmptyArray([1], "field")).toBe(true);
      expect(agent.testValidateNonEmptyArray(["a", "b"], "field")).toBe(true);
    });

    test("should return false for empty arrays", () => {
      expect(agent.testValidateNonEmptyArray([], "field")).toBe(false);
    });

    test("should return false for null/undefined", () => {
      expect(agent.testValidateNonEmptyArray(null, "field")).toBe(false);
      expect(agent.testValidateNonEmptyArray(undefined, "field")).toBe(false);
    });

    test("should work with different array types", () => {
      expect(agent.testValidateNonEmptyArray([1, 2, 3], "field")).toBe(true);
      expect(agent.testValidateNonEmptyArray(["a", "b"], "field")).toBe(true);
      expect(agent.testValidateNonEmptyArray([{ key: "value" }], "field")).toBe(true);
    });

    test("should work as type guard", () => {
      const value: string[] | null = ["test"];
      if (agent.testValidateNonEmptyArray(value, "field")) {
        // TypeScript should know value is string[] here
        expect(value.length).toBe(1);
      }
    });
  });

  describe("validateFields", () => {
    test("should succeed when all validations pass", () => {
      const result = agent.testValidateFields({
        field1: { value: "value", type: "nonEmpty" },
        field2: { value: ["item"], type: "nonEmptyArray" },
        field3: { value: 123, type: "required" }
      });
      expect(result.success).toBe(true);
    });

    test("should fail on required field validation", () => {
      const result = agent.testValidateFields({
        field1: { value: null, type: "required" },
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.category).toBe(ErrorCategory.VALIDATION_ERROR);
        expect(result.error.message).toContain("field1");
        expect(result.error.message).toContain("required");
      }
    });

    test("should fail on nonEmpty field validation", () => {
      const result = agent.testValidateFields({
        field1: { value: "", type: "nonEmpty" },
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.category).toBe(ErrorCategory.VALIDATION_ERROR);
        expect(result.error.message).toContain("field1");
        expect(result.error.message).toContain("empty");
      }
    });

    test("should fail on nonEmptyArray field validation", () => {
      const result = agent.testValidateFields({
        field1: { value: [], type: "nonEmptyArray" },
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.category).toBe(ErrorCategory.VALIDATION_ERROR);
        expect(result.error.message).toContain("field1");
        expect(result.error.message).toContain("array");
      }
    });

    test("should fail on first validation error", () => {
      const result = agent.testValidateFields({
        field1: { value: "", type: "nonEmpty" },
        field2: { value: ["item"], type: "nonEmptyArray" }
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.category).toBe(ErrorCategory.VALIDATION_ERROR);
        expect(result.error.message).toContain("field1");
      }
    });

    test("should validate multiple fields correctly", () => {
      const result = agent.testValidateFields({
        name: { value: "John", type: "nonEmpty" },
        age: { value: 30, type: "required" },
        tags: { value: ["tag1"], type: "nonEmptyArray" }
      });
      expect(result.success).toBe(true);
    });

    test("should include requestingAgentId in error", () => {
      const requestingAgentId = "requesting-agent" as AgentId;
      const result = agent.testValidateFields({
        field1: { value: null, type: "required" },
      }, requestingAgentId);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.requestingAgentId).toBe(requestingAgentId);
      }
    });
  });

  describe("withErrorHandling", () => {
    test("should return success for successful operations", async () => {
      const result = await agent.testWithErrorHandling(
        async () => ({ success: true as const, result: "data" }),
        "test-operation"
      );
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.result).toBe("data");
      }
    });

    test("should catch and wrap thrown errors", async () => {
      const result = await agent.testWithErrorHandling(
        async () => {
          throw new Error("Test error");
        },
        "test-operation"
      );
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.category).toBe(ErrorCategory.UNEXPECTED_ERROR);
        expect(result.error.message).toContain("Test error");
        expect(result.error.message).toContain("test-operation");
      }
    });

    test("should preserve stack traces", async () => {
      const result = await agent.testWithErrorHandling(
        async () => {
          throw new Error("Test error");
        },
        "test-operation"
      );
      if (!result.success && result.error.details) {
        expect(result.error.details.stack).toBeDefined();
        expect(typeof result.error.details.stack).toBe("string");
      }
    });

    test("should handle non-Error throws", async () => {
      const result = await agent.testWithErrorHandling(
        async () => {
          throw "String error";
        },
        "test-operation"
      );
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toContain("String error");
      }
    });

    test("should pass through failed ContractResults", async () => {
      const error = agent.testCreateError("Custom error", ErrorCategory.VALIDATION_ERROR);
      const result = await agent.testWithErrorHandling(
        async () => failure(error),
        "test-operation"
      );
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toBe("Custom error");
        expect(result.error.category).toBe(ErrorCategory.VALIDATION_ERROR);
      }
    });
  });

  describe("Error Creation Methods", () => {
    test("createError should create proper error structure", () => {
      const error = agent.testCreateError(
        "Test message",
        ErrorCategory.VALIDATION_ERROR,
        "TestCode"
      );
      expect(error.agentId).toBe("test-agent");
      expect(error.message).toBe("Test message");
      expect(error.category).toBe(ErrorCategory.VALIDATION_ERROR);
      expect(error.name).toBe("TestCode");
    });

    test("createError should use default name if not provided", () => {
      const error = agent.testCreateError(
        "Test message",
        ErrorCategory.VALIDATION_ERROR
      );
      expect(error.name).toBe("AgentError");
    });

    test("createValidationError should use VALIDATION_ERROR category", () => {
      const error = agent.testCreateValidationError("field", "Field is invalid");
      expect(error.category).toBe(ErrorCategory.VALIDATION_ERROR);
      expect(error.message).toBe("Field is invalid");
      expect(error.details).toEqual({ fieldName: "field" });
    });

    test("createValidationError should generate default message", () => {
      const error = agent.testCreateValidationError("field");
      expect(error.message).toBe("field validation failed");
    });

    test("createOperationError should use OPERATION_FAILED category", () => {
      const error = agent.testCreateOperationError("save", new Error("Save failed"));
      expect(error.category).toBe(ErrorCategory.OPERATION_FAILED);
      expect(error.message).toContain("save failed");
      expect(error.message).toContain("Save failed");
    });

    test("createOperationError should handle Error objects", () => {
      const originalError = new Error("Original error");
      originalError.stack = "stack trace here";
      const error = agent.testCreateOperationError("operation", originalError);
      expect(error.details?.originalError).toBe("stack trace here");
    });

    test("createOperationError should handle non-Error objects", () => {
      const error = agent.testCreateOperationError("operation", "string error");
      expect(error.message).toContain("string error");
      expect(error.details?.originalError).toBe("string error");
    });

    test("createNotImplementedError should use NOT_IMPLEMENTED category", () => {
      const error = agent.testCreateNotImplementedError("someMethod");
      expect(error.category).toBe(ErrorCategory.NOT_IMPLEMENTED);
      expect(error.message).toContain("someMethod");
      expect(error.message).toContain("not implemented");
      expect(error.details).toEqual({ methodName: "someMethod" });
    });
  });

  describe("Integration Tests", () => {
    test("should work in a complete validation workflow", async () => {
      const result = await agent.testWithErrorHandling(async () => {
        // Validate fields
        const validation = agent.testValidateFields({
          name: { value: "Test", type: "nonEmpty" },
          items: { value: [1, 2, 3], type: "nonEmptyArray" }
        });

        if (!validation.success) {
          return validation;
        }

        // Business logic
        return success({ status: "completed" });
      }, "complete-workflow");

      expect(result.success).toBe(true);
    });

    test("should properly fail in validation workflow", async () => {
      const result = await agent.testWithErrorHandling(async () => {
        // Validate fields
        const validation = agent.testValidateFields({
          name: { value: "", type: "nonEmpty" },
          items: { value: [1, 2, 3], type: "nonEmptyArray" }
        });

        if (!validation.success) {
          return validation;
        }

        // Business logic (won't reach here)
        return success({ status: "completed" });
      }, "complete-workflow");

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.category).toBe(ErrorCategory.VALIDATION_ERROR);
      }
    });
  });
});
