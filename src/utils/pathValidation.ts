import path from "path";
import { ContractResult, success, failure, createAgentError, ErrorCategory } from "../contracts/types";

/**
 * Validates that a component name is safe for use in file paths
 * Prevents path traversal attacks and directory escape
 */
export function validateComponentName(componentName: string): ContractResult<string> {
  // Check for empty or whitespace-only
  if (!componentName || componentName.trim().length === 0) {
    return failure(
      createAgentError(
        "path-validator",
        "Component name cannot be empty",
        ErrorCategory.VALIDATION_ERROR,
        "EmptyComponentNameError"
      )
    );
  }

  // Normalize the path
  const normalized = path.normalize(componentName);

  // Check for path traversal attempts
  if (normalized.includes('..') || normalized.startsWith('/') || normalized.startsWith('\\')) {
    return failure(
      createAgentError(
        "path-validator",
        "Component name contains invalid path characters. Path traversal attempts are not allowed.",
        ErrorCategory.VALIDATION_ERROR,
        "PathTraversalAttemptError",
        undefined,
        { componentName, normalized }
      )
    );
  }

  // Whitelist allowed characters (alphanumeric, hyphens, underscores)
  if (!/^[a-zA-Z0-9_-]+$/.test(normalized)) {
    return failure(
      createAgentError(
        "path-validator",
        "Component name can only contain alphanumeric characters, hyphens, and underscores",
        ErrorCategory.VALIDATION_ERROR,
        "InvalidComponentNameError",
        undefined,
        { componentName, allowedPattern: "^[a-zA-Z0-9_-]+$" }
      )
    );
  }

  return success(normalized);
}

/**
 * Validates that a target directory is safe
 * Allows relative or absolute paths, validates against path traversal
 * If allowedRoots specified, enforces absolute paths within those roots
 */
export function validateTargetDirectory(
  targetDir: string,
  allowedRoots?: string[]
): ContractResult<string> {
  // Normalize the path
  const normalized = path.normalize(targetDir);

  // Check for path traversal attempts in the original path
  // Detect patterns like ../../ that try to escape the intended directory
  const dangerousPatterns = ['../', '..\\'];
  const startsWithDanger = dangerousPatterns.some(pattern =>
    targetDir.startsWith(pattern) || targetDir.includes(`/${pattern}`) || targetDir.includes(`\\${pattern}`)
  );

  if (startsWithDanger && !path.isAbsolute(targetDir)) {
    return failure(
      createAgentError(
        "path-validator",
        "Target directory contains path traversal attempts",
        ErrorCategory.VALIDATION_ERROR,
        "PathTraversalAttemptError",
        undefined,
        { targetDir, normalized }
      )
    );
  }

  // If allowed roots are specified, must be absolute path
  if (allowedRoots && allowedRoots.length > 0) {
    if (!path.isAbsolute(normalized)) {
      return failure(
        createAgentError(
          "path-validator",
          "Target directory must be an absolute path when allowedRoots are specified",
          ErrorCategory.VALIDATION_ERROR,
          "RelativePathError",
          undefined,
          { targetDir, normalized }
        )
      );
    }

    const isAllowed = allowedRoots.some(root => {
      const normalizedRoot = path.normalize(root);
      return normalized.startsWith(normalizedRoot);
    });

    if (!isAllowed) {
      return failure(
        createAgentError(
          "path-validator",
          "Target directory is outside allowed paths",
          ErrorCategory.VALIDATION_ERROR,
          "UnauthorizedPathError",
          undefined,
          { targetDir, allowedRoots }
        )
      );
    }
  }

  return success(normalized);
}

/**
 * Safely joins a directory and component name after validation
 */
export function safePathJoin(
  targetDir: string,
  componentName: string,
  allowedRoots?: string[]
): ContractResult<string> {
  // Validate target directory
  const dirResult = validateTargetDirectory(targetDir, allowedRoots);
  if (!dirResult.success) return dirResult;

  // Validate component name
  const nameResult = validateComponentName(componentName);
  if (!nameResult.success) return nameResult;

  // Join paths
  const safePath = path.join(dirResult.result, nameResult.result.toLowerCase());

  return success(safePath);
}
