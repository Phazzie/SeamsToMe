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
   */
  protected validateRequired(
    value: any,
    fieldName: string,
    requestingAgentId?: AgentId
  ): ContractResult<void> {
    if (value === null || value === undefined) {
      return failure(
        createAgentError(
          this.agentId,
          `${fieldName} is required`,
          ErrorCategory.VALIDATION_ERROR,
          "ValidationError",
          requestingAgentId
        )
      );
    }
    return success(undefined);
  }

  /**
   * Validate that a string is not empty
   */
  protected validateNonEmpty(
    value: string | undefined | null,
    fieldName: string,
    requestingAgentId?: AgentId
  ): ContractResult<void> {
    if (!value || value.trim() === "") {
      return failure(
        createAgentError(
          this.agentId,
          `${fieldName} cannot be empty`,
          ErrorCategory.VALIDATION_ERROR,
          "ValidationError",
          requestingAgentId
        )
      );
    }
    return success(undefined);
  }

  /**
   * Validate that an array is not empty
   */
  protected validateNonEmptyArray(
    value: any[] | undefined | null,
    fieldName: string,
    requestingAgentId?: AgentId
  ): ContractResult<void> {
    if (!value || value.length === 0) {
      return failure(
        createAgentError(
          this.agentId,
          `${fieldName} cannot be empty`,
          ErrorCategory.VALIDATION_ERROR,
          "ValidationError",
          requestingAgentId
        )
      );
    }
    return success(undefined);
  }

  /**
   * Validate request object exists
   */
  protected validateRequest(
    request: any,
    requestingAgentId?: AgentId
  ): ContractResult<void> {
    if (!request) {
      return failure(
        createAgentError(
          this.agentId,
          "Request is null or undefined",
          ErrorCategory.BAD_REQUEST,
          "BadRequestError",
          requestingAgentId
        )
      );
    }
    return success(undefined);
  }

  /**
   * Create a standardized error
   */
  protected createError(
    message: string,
    category: ErrorCategory,
    name: string = "AgentError",
    requestingAgentId?: AgentId,
    details?: any
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
    } catch (error: any) {
      return failure(
        createAgentError(
          this.agentId,
          `${operation} failed: ${error.message}`,
          ErrorCategory.UNEXPECTED_ERROR,
          "UnexpectedError",
          requestingAgentId,
          { originalError: error, stack: error.stack }
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
   *   'categories': { value: request.categories, type: 'array' }
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
      { value: any; type: "required" | "nonEmpty" | "array" }
    >,
    requestingAgentId?: AgentId
  ): ContractResult<void> {
    for (const [fieldName, config] of Object.entries(fields)) {
      let result: ContractResult<void>;

      switch (config.type) {
        case "required":
          result = this.validateRequired(
            config.value,
            fieldName,
            requestingAgentId
          );
          break;
        case "nonEmpty":
          result = this.validateNonEmpty(
            config.value,
            fieldName,
            requestingAgentId
          );
          break;
        case "array":
          result = this.validateNonEmptyArray(
            config.value,
            fieldName,
            requestingAgentId
          );
          break;
        default:
          continue;
      }

      if (!result.success) {
        return result;
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
 *       'field2': { value: request.field2, type: 'array' }
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
