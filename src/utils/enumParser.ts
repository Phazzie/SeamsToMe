/**
 * PURPOSE: Utility functions for parsing and validating enum values
 * DATA FLOW: Called by agents to parse string inputs into enum types
 * INTEGRATION POINTS: All agents that parse enum values
 * CONTRACT VERSION: v1
 * ERROR HANDLING: Returns default value for invalid inputs
 */

/**
 * Parse a value into an enum type with normalization
 *
 * @param value - The value to parse (can be any type)
 * @param enumValues - Array of valid enum values
 * @param defaultValue - Value to return if parsing fails
 * @param normalize - Function to normalize the input string (default: uppercase)
 * @returns The parsed enum value or default value
 *
 * @example
 * // Parse status with uppercase normalization
 * const status = parseEnum(
 *   "active",
 *   ["ACTIVE", "DEPRECATED", "PLANNED"],
 *   "ACTIVE"
 * );
 * // Returns: "ACTIVE"
 *
 * @example
 * // Parse with custom normalization
 * const status = parseEnum(
 *   "partially compliant",
 *   Object.values(ComplianceStatus),
 *   ComplianceStatus.NEEDS_REVIEW,
 *   (s) => s.toUpperCase().replace(/\s+/g, "_")
 * );
 * // Returns: "PARTIALLY_COMPLIANT"
 */
export function parseEnum<T>(
  value: any,
  enumValues: T[],
  defaultValue: T,
  normalize: (s: string) => string = (s) => s.toUpperCase()
): T {
  if (!value && value !== 0) return defaultValue;

  try {
    const normalized = normalize(String(value));
    return enumValues.includes(normalized as T)
      ? (normalized as T)
      : defaultValue;
  } catch {
    return defaultValue;
  }
}

/**
 * Parse an enum value with snake_case normalization
 *
 * @param value - The value to parse
 * @param enumValues - Array of valid enum values
 * @param defaultValue - Value to return if parsing fails
 * @returns The parsed enum value or default value
 *
 * @example
 * parseEnumSnakeCase("Partially Compliant", [...], "NEEDS_REVIEW")
 * // Returns: "PARTIALLY_COMPLIANT"
 */
export function parseEnumSnakeCase<T>(
  value: any,
  enumValues: T[],
  defaultValue: T
): T {
  return parseEnum(
    value,
    enumValues,
    defaultValue,
    (s) => s.toUpperCase().replace(/\s+/g, "_")
  );
}

/**
 * Parse an enum value with kebab-case normalization
 *
 * @param value - The value to parse
 * @param enumValues - Array of valid enum values
 * @param defaultValue - Value to return if parsing fails
 * @returns The parsed enum value or default value
 *
 * @example
 * parseEnumKebabCase("Partially Compliant", [...], "needs-review")
 * // Returns: "partially-compliant"
 */
export function parseEnumKebabCase<T>(
  value: any,
  enumValues: T[],
  defaultValue: T
): T {
  return parseEnum(
    value,
    enumValues,
    defaultValue,
    (s) => s.toLowerCase().replace(/\s+/g, "-")
  );
}

/**
 * Check if a value is a valid enum value
 *
 * @param value - The value to check
 * @param enumValues - Array of valid enum values
 * @returns True if value is valid, false otherwise
 *
 * @example
 * isValidEnum("ACTIVE", ["ACTIVE", "DEPRECATED"])  // true
 * isValidEnum("INVALID", ["ACTIVE", "DEPRECATED"])  // false
 */
export function isValidEnum<T>(value: any, enumValues: T[]): boolean {
  return enumValues.includes(value as T);
}
