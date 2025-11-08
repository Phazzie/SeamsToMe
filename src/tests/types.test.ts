import {
  createAgentError,
  createErrorDetails,
  StackTraceDetails,
  OperationDetails,
  ValidationDetails,
  DispatchDetails,
  ErrorCategory,
  AgentId,
  isAgentError,
} from "../contracts/types";

describe("Error Type Safety", () => {
  test("should create error with stack trace details", () => {
    const details: StackTraceDetails = {
      originalError: "Test error",
      stack: "Stack trace...",
    };

    const error = createAgentError(
      "test-agent" as AgentId,
      "Operation failed",
      ErrorCategory.UNEXPECTED_ERROR,
      "TestError",
      undefined,
      details
    );

    expect(error.details).toBeDefined();
    expect(error.details?.originalError).toBe("Test error");
    expect(error.details?.stack).toBe("Stack trace...");
  });

  test("should create error with operation details", () => {
    const details: OperationDetails = {
      operation: "save",
      targetPath: "/test/path",
      attemptCount: 3,
    };

    const error = createAgentError(
      "test-agent" as AgentId,
      "Save failed",
      ErrorCategory.OPERATION_FAILED,
      "SaveError",
      undefined,
      details
    );

    expect(error.details?.operation).toBe("save");
    expect(error.details?.targetPath).toBe("/test/path");
    expect(error.details?.attemptCount).toBe(3);
  });

  test("should create error with validation details", () => {
    const details: ValidationDetails = {
      field: "email",
      providedValue: "invalid",
      expectedFormat: "email",
    };

    const error = createAgentError(
      "test-agent" as AgentId,
      "Validation failed",
      ErrorCategory.VALIDATION_ERROR,
      "ValidationError",
      undefined,
      details
    );

    expect(error.details?.field).toBe("email");
    expect(error.details?.providedValue).toBe("invalid");
    expect(error.details?.expectedFormat).toBe("email");
  });

  test("should create error with dispatch details", () => {
    const details: DispatchDetails = {
      agentId: "target-agent" as AgentId,
      action: "testAction",
      availableAgents: ["agent1" as AgentId, "agent2" as AgentId],
      availableActions: ["action1", "action2"],
    };

    const error = createAgentError(
      "orchestrator" as AgentId,
      "Dispatch failed",
      ErrorCategory.AGENT_UNAVAILABLE,
      "DispatchError",
      undefined,
      details
    );

    expect(error.details?.agentId).toBe("target-agent");
    expect(error.details?.action).toBe("testAction");
    expect(Array.isArray(error.details?.availableAgents)).toBe(true);
    expect(Array.isArray(error.details?.availableActions)).toBe(true);
  });

  test("createErrorDetails helper should preserve types", () => {
    const details = createErrorDetails({
      customField: "value",
      numericField: 42,
      booleanField: true,
      nestedObject: { key: "value" },
    });

    expect(details.customField).toBe("value");
    expect(details.numericField).toBe(42);
    expect(details.booleanField).toBe(true);
    expect(details.nestedObject).toEqual({ key: "value" });
  });

  test("should handle errors without details", () => {
    const error = createAgentError(
      "test-agent" as AgentId,
      "Simple error",
      ErrorCategory.UNEXPECTED_ERROR
    );

    expect(error.details).toBeUndefined();
    expect(error.name).toBe("AgentError");
    expect(error.message).toBe("Simple error");
    expect(error.category).toBe(ErrorCategory.UNEXPECTED_ERROR);
  });

  test("should handle empty details object", () => {
    const error = createAgentError(
      "test-agent" as AgentId,
      "Error with empty details",
      ErrorCategory.UNEXPECTED_ERROR,
      "TestError",
      undefined,
      {}
    );

    expect(error.details).toEqual({});
  });

  test("should create error with mixed details types", () => {
    const details = createErrorDetails({
      stringField: "text",
      numberField: 123,
      booleanField: true,
      nullField: null,
      undefinedField: undefined,
      arrayField: [1, 2, 3],
      objectField: { nested: "value" },
    });

    expect(details.stringField).toBe("text");
    expect(details.numberField).toBe(123);
    expect(details.booleanField).toBe(true);
    expect(details.nullField).toBeNull();
    expect(details.undefinedField).toBeUndefined();
    expect(details.arrayField).toEqual([1, 2, 3]);
    expect(details.objectField).toEqual({ nested: "value" });
  });

  test("isAgentError should correctly identify AgentError objects", () => {
    const validError = createAgentError(
      "test-agent" as AgentId,
      "Test error",
      ErrorCategory.VALIDATION_ERROR
    );

    expect(isAgentError(validError)).toBe(true);
  });

  test("isAgentError should reject non-AgentError objects", () => {
    expect(isAgentError(null)).toBe(false);
    expect(isAgentError(undefined)).toBe(false);
    expect(isAgentError("string")).toBe(false);
    expect(isAgentError(123)).toBe(false);
    expect(isAgentError({})).toBe(false);
    expect(isAgentError({ name: "Error" })).toBe(false);
    expect(
      isAgentError({
        name: "Error",
        message: "Test",
        // missing agentId and category
      })
    ).toBe(false);
  });

  test("should maintain type safety with optional fields", () => {
    const error = createAgentError(
      "test-agent" as AgentId,
      "Test error",
      ErrorCategory.VALIDATION_ERROR,
      "ValidationError",
      "requesting-agent" as AgentId,
      { field: "testField" }
    );

    expect(error.requestingAgentId).toBe("requesting-agent");
    expect(error.details?.field).toBe("testField");
  });

  test("should accept Record<string, unknown> for details", () => {
    const details: Record<string, unknown> = {
      dynamicKey: "dynamicValue",
      anotherKey: 42,
    };

    const error = createAgentError(
      "test-agent" as AgentId,
      "Dynamic error",
      ErrorCategory.UNEXPECTED_ERROR,
      "DynamicError",
      undefined,
      details
    );

    expect(error.details).toBe(details);
    expect(error.details?.dynamicKey).toBe("dynamicValue");
    expect(error.details?.anotherKey).toBe(42);
  });
});

describe("Error Detail Type Helpers", () => {
  test("StackTraceDetails should work with error objects", () => {
    const originalError = new Error("Original error message");
    const details: StackTraceDetails = {
      originalError: originalError.message,
      stack: originalError.stack,
    };

    expect(details.originalError).toBe("Original error message");
    expect(details.stack).toBeDefined();
  });

  test("OperationDetails should support optional fields", () => {
    const minimalDetails: OperationDetails = {
      operation: "test",
    };

    const fullDetails: OperationDetails = {
      operation: "test",
      targetPath: "/path",
      attemptCount: 3,
    };

    expect(minimalDetails.operation).toBe("test");
    expect(minimalDetails.targetPath).toBeUndefined();
    expect(fullDetails.attemptCount).toBe(3);
  });

  test("ValidationDetails should handle unknown providedValue", () => {
    const details: ValidationDetails = {
      field: "testField",
      providedValue: { complex: "object" },
      expectedFormat: "string",
    };

    expect(details.providedValue).toEqual({ complex: "object" });
  });

  test("DispatchDetails should handle agent arrays", () => {
    const details: DispatchDetails = {
      agentId: "target" as AgentId,
      action: "testAction",
      availableAgents: ["agent1", "agent2", "agent3"] as AgentId[],
    };

    expect(details.availableAgents?.length).toBe(3);
  });
});
