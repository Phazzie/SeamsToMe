/**
 * PURPOSE: Base class for all agents to reduce code duplication
 * DATA FLOW: All agents extend BaseAgent → Inherit common utilities
 * INTEGRATION POINTS: All agent implementations
 * CONTRACT VERSION: v1
 * ERROR HANDLING: Provides standardized error handling utilities
 */

import {
  AgentError,
  AgentId,
  ContractResult,
  createAgentError,
  ErrorCategory,
  failure,
  success,
} from "../contracts/types";

/**
 * BaseAgent - Abstract base class for all agents
 *
 * Provides common utilities to eliminate 77+ duplicate error handling blocks
 * across the codebase. All agents should extend this class.
 *
 * Benefits:
 * - Consistent error handling
 * - Reduced code duplication
 * - Standardized validation
 * - Easier testing and maintenance
 */
export abstract class BaseAgent {
  /**
   * Agent identifier - must be implemented by subclass
   */
  protected abstract readonly agentId: AgentId;

  /**
   * Validate that a value is not null or undefined
   * Returns a type guard for type safety
   */
  protected validateRequired<T>(
    value: T | null | undefined,
    fieldName: string,
    requestingAgentId?: AgentId
  ): value is T {
    if (value === null || value === undefined) {
      return false;
    }
    return true;
  }

  /**
   * Validate that a string is not empty
   * Returns a type guard for type safety
   */
  protected validateNonEmpty(
    value: string | null | undefined,
    fieldName: string,
    requestingAgentId?: AgentId
  ): value is string {
    if (!value || typeof value !== 'string' || value.trim() === "") {
      return false;
    }
    return true;
  }

  /**
   * Validate that an array is not empty
   * Returns a type guard for type safety
   */
  protected validateNonEmptyArray<T>(
    value: T[] | undefined | null,
    fieldName: string,
    requestingAgentId?: AgentId
  ): value is T[] {
    if (!Array.isArray(value) || value.length === 0) {
      return false;
    }
    return true;
  }

  /**
   * Validate request object exists
   * Returns a type guard for type safety
   */
  protected validateRequest<T>(
    request: T | null | undefined,
    requestingAgentId?: AgentId
  ): request is T {
    if (!request) {
      return false;
    }
    return true;
  }

  /**
   * Create a standardized error
   */
  protected createError(
    message: string,
    category: ErrorCategory,
    name: string = "AgentError",
    requestingAgentId?: AgentId,
    details?: Record<string, unknown>
  ): AgentError {
    return createAgentError(
      this.agentId,
      message,
      category,
      name,
      requestingAgentId,
      details
    );
  }

  /**
   * Wrap a function with standard error handling
   *
   * Example:
   * ```typescript
   * return this.withErrorHandling(async () => {
   *   // Your business logic here
   *   return success(result);
   * }, "operation name", request.requestingAgentId);
   * ```
   */
  protected async withErrorHandling<R>(
    fn: () => Promise<ContractResult<R>>,
    operation: string,
    requestingAgentId?: AgentId
  ): Promise<ContractResult<R>> {
    try {
      return await fn();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      const errorStack = error instanceof Error ? error.stack : undefined;

      return failure(
        createAgentError(
          this.agentId,
          `${operation} failed: ${errorMessage}`,
          ErrorCategory.UNEXPECTED_ERROR,
          "UnexpectedError",
          requestingAgentId,
          { originalError: String(error), stack: errorStack }
        )
      );
    }
  }

  /**
   * Validate multiple fields at once
   *
   * Example:
   * ```typescript
   * const validationResult = this.validateFields({
   *   'targetPath': { value: request.targetPath, type: 'nonEmpty' },
   *   'categories': { value: request.categories, type: 'nonEmptyArray' }
   * }, request.requestingAgentId);
   *
   * if (!validationResult.success) {
   *   return validationResult;
   * }
   * ```
   */
  protected validateFields(
    fields: Record<
      string,
      { value: unknown; type: "required" | "nonEmpty" | "nonEmptyArray" }
    >,
    requestingAgentId?: AgentId
  ): ContractResult<void> {
    for (const [fieldName, config] of Object.entries(fields)) {
      const { value, type } = config;

      switch (type) {
        case "required":
          if (!this.validateRequired(value, fieldName, requestingAgentId)) {
            return failure(
              this.createValidationError(
                fieldName,
                `${fieldName} is required`,
                requestingAgentId
              )
            );
          }
          break;
        case "nonEmpty":
          if (!this.validateNonEmpty(value as string, fieldName, requestingAgentId)) {
            return failure(
              this.createValidationError(
                fieldName,
                `${fieldName} cannot be empty`,
                requestingAgentId
              )
            );
          }
          break;
        case "nonEmptyArray":
          if (!this.validateNonEmptyArray(value as unknown[], fieldName, requestingAgentId)) {
            return failure(
              this.createValidationError(
                fieldName,
                `${fieldName} must be a non-empty array`,
                requestingAgentId
              )
            );
          }
          break;
      }
    }

    return success(undefined);
  }

  /**
   * Check if validation result is successful
   * Helper for cleaner validation code
   */
  protected isValid(result: ContractResult<void>): boolean {
    return result.success;
  }

  /**
   * Create a not implemented error
   * Use this for stub methods that haven't been implemented yet
   */
  protected createNotImplementedError(
    methodName: string,
    requestingAgentId?: AgentId
  ): AgentError {
    return createAgentError(
      this.agentId,
      `Method '${methodName}' is not implemented`,
      ErrorCategory.NOT_IMPLEMENTED,
      "NotImplementedError",
      requestingAgentId,
      { methodName }
    );
  }

  /**
   * Create a validation error
   * Shorthand for common validation failure patterns
   *
   * @example
   * return failure(this.createValidationError("targetPath"));
   * return failure(this.createValidationError("targetPath", "Must be absolute path"));
   */
  protected createValidationError(
    fieldName: string,
    message?: string,
    requestingAgentId?: AgentId
  ): AgentError {
    return createAgentError(
      this.agentId,
      message || `${fieldName} validation failed`,
      ErrorCategory.VALIDATION_ERROR,
      "ValidationError",
      requestingAgentId,
      { fieldName }
    );
  }

  /**
   * Create an operation error from a caught exception
   * Standardizes error handling for failed operations
   *
   * @example
   * catch (error) {
   *   return failure(this.createOperationError("checkCompliance", error));
   * }
   */
  protected createOperationError(
    operation: string,
    error: unknown,
    requestingAgentId?: AgentId
  ): AgentError {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;

    return createAgentError(
      this.agentId,
      `${operation} failed: ${errorMessage}`,
      ErrorCategory.OPERATION_FAILED,
      `${this.capitalize(operation)}Error`,
      requestingAgentId,
      { originalError: errorStack || String(error) }
    );
  }

  /**
   * Capitalize first letter of a string
   * Helper for creating error names
   */
  private capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}

/**
 * Example usage:
 *
 * ```typescript
 * export class MyAgent extends BaseAgent implements IMyContract {
 *   protected readonly agentId = "my-agent";
 *
 *   async myMethod(request: MyRequest): Promise<ContractResult<MyResult>> {
 *     // Validate request
 *     const requestValidation = this.validateRequest(request);
 *     if (!requestValidation.success) return requestValidation;
 *
 *     // Validate fields
 *     const fieldsValidation = this.validateFields({
 *       'field1': { value: request.field1, type: 'nonEmpty' },
 *       'field2': { value: request.field2, type: 'nonEmptyArray' }
 *     }, request.requestingAgentId);
 *     if (!fieldsValidation.success) return fieldsValidation;
 *
 *     // Wrap business logic with error handling
 *     return this.withErrorHandling(async () => {
 *       // Your business logic here
 *       const result = await doSomething();
 *       return success(result);
 *     }, "myMethod", request.requestingAgentId);
 *   }
 * }
 * ```
 */
